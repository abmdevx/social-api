import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { hashToken, safeEqual } from "../lib/tokenHash.js";
import { toPublicUser, type PublicUser } from "../lib/serializers.js";
import { visibleVideoFilter } from "../lib/visibility.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { getUploadedFile } from "../middlewares/upload.middleware.js";
import { Subscription } from "../models/subscription.model.js";
import { User, BCRYPT_ROUNDS } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  deleteAssetsQuietly,
  uploadAllOrNone,
  uploadToCloudinary,
  type UploadJob,
} from "../services/cloudinary.service.js";
import { REFRESH_COOKIE, clearSessionCookies, startSession } from "../services/session.service.js";
import { tokens } from "../services/token.service.js";
import {
  changePasswordBody,
  loginBody,
  refreshBody,
  registerBody,
  updateAccountBody,
  usernameParams,
} from "../validators/user.validators.js";

/** Compared against when the account does not exist, so "unknown user" costs the same time as "wrong password". */
let dummyHash: Promise<string> | undefined;
const getDummyHash = (): Promise<string> =>
  (dummyHash ??= bcrypt.hash("timing-equaliser", BCRYPT_ROUNDS));

const INVALID_CREDENTIALS = "Invalid username/email or password";
const HISTORY_LIMIT = 100;

export async function registerUser(req: Request, res: Response): Promise<void> {
  const body = registerBody.parse(req.body);

  const avatarFile = getUploadedFile(req, "avatar");
  const coverFile = getUploadedFile(req, "coverImage");
  if (!avatarFile) throw ApiError.badRequest("An avatar image is required");

  // Cheap duplicate check first so we never upload media for an account that cannot be created.
  const existing = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] })
    .select("username email")
    .lean();
  if (existing) {
    throw ApiError.conflict(
      existing.username === body.username
        ? "Username is already taken"
        : "Email is already registered"
    );
  }

  const jobs: UploadJob[] = [{ path: avatarFile.path, resourceType: "image", folder: "avatars" }];
  if (coverFile) jobs.push({ path: coverFile.path, resourceType: "image", folder: "covers" });
  const [avatar, cover] = await uploadAllOrNone(jobs);
  if (!avatar) throw new ApiError(502, "Media upload failed. Please try again.");

  try {
    const user = await User.create({
      username: body.username,
      email: body.email,
      fullName: body.fullName,
      password: body.password,
      avatar: { url: avatar.url, publicId: avatar.publicId },
      ...(cover ? { coverImage: { url: cover.url, publicId: cover.publicId } } : {}),
    });
    sendSuccess(res, 201, toPublicUser(user.toObject()), "User registered successfully");
  } catch (error) {
    // A concurrent registration can still win the unique index; do not leave orphaned media.
    await deleteAssetsQuietly([
      { publicId: avatar.publicId, resourceType: "image" },
      { publicId: cover?.publicId, resourceType: "image" },
    ]);
    throw error;
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  const { username, email, password } = loginBody.parse(req.body);

  const alternatives = [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])];
  const user = await User.findOne({ $or: alternatives }).select("+password");

  if (!user) {
    await bcrypt.compare(password, await getDummyHash());
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }
  if (!(await user.isPasswordCorrect(password))) throw ApiError.unauthorized(INVALID_CREDENTIALS);

  const session = await startSession(res, user._id.toString());
  if (!session) throw ApiError.unauthorized(INVALID_CREDENTIALS);

  sendSuccess(
    res,
    200,
    { user: toPublicUser(user.toObject()), ...session },
    "User logged in successfully"
  );
}

export async function logoutUser(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  await User.updateOne({ _id: user._id }, { $unset: { refreshTokenHash: 1 } });
  clearSessionCookies(res);
  sendSuccess(res, 200, {}, "User logged out");
}

export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
  const cookieToken: unknown = req.cookies?.[REFRESH_COOKIE];
  const bodyToken = refreshBody.parse(req.body ?? {}).refreshToken;
  const presented = typeof cookieToken === "string" && cookieToken ? cookieToken : bodyToken;
  if (!presented) throw ApiError.unauthorized("Refresh token is missing");

  let userId: string;
  try {
    userId = tokens.verifyRefreshToken(presented);
  } catch {
    clearSessionCookies(res);
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(userId).select("+refreshTokenHash");
  const presentedHash = hashToken(presented);

  if (!user || !user.refreshTokenHash || !safeEqual(user.refreshTokenHash, presentedHash)) {
    // A valid signature that does not match the stored hash means the token was already
    // rotated away: treat it as theft/replay and end the session everywhere.
    if (user?.refreshTokenHash)
      await User.updateOne({ _id: user._id }, { $unset: { refreshTokenHash: 1 } });
    clearSessionCookies(res);
    throw ApiError.unauthorized("Refresh token is expired or has already been used");
  }

  const session = await startSession(res, userId, presentedHash);
  if (!session) {
    clearSessionCookies(res);
    throw ApiError.unauthorized("Refresh token is expired or has already been used");
  }
  sendSuccess(res, 200, session, "Access token refreshed");
}

export async function changeCurrentPassword(req: Request, res: Response): Promise<void> {
  const authUser = getAuthUser(req);
  const { oldPassword, newPassword } = changePasswordBody.parse(req.body);

  const user = await User.findById(authUser._id).select("+password");
  if (!user || !(await user.isPasswordCorrect(oldPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  user.password = newPassword; // hashed by the pre-save hook
  await user.save();

  // Rotating the refresh token signs every other device out; this device keeps going.
  await startSession(res, user._id.toString());
  sendSuccess(res, 200, {}, "Password changed successfully");
}

export function getCurrentUser(req: Request, res: Response): void {
  sendSuccess(res, 200, toPublicUser(getAuthUser(req)), "User fetched successfully");
}

export async function updateAccountDetails(req: Request, res: Response): Promise<void> {
  const authUser = getAuthUser(req);
  const changes = updateAccountBody.parse(req.body);

  const user = await User.findByIdAndUpdate(
    authUser._id,
    { $set: changes },
    { new: true, runValidators: true }
  ).lean<PublicUser>();
  if (!user) throw ApiError.notFound("User not found");
  sendSuccess(res, 200, toPublicUser(user), "Account details updated successfully");
}

async function replaceProfileImage(
  req: Request,
  res: Response,
  field: "avatar" | "coverImage"
): Promise<void> {
  const authUser = getAuthUser(req);
  const file = getUploadedFile(req, field);
  if (!file)
    throw ApiError.badRequest(
      `A ${field === "avatar" ? "avatar" : "cover image"} file is required`
    );

  const current = await User.findById(authUser._id)
    .select(field)
    .lean<{ avatar?: { publicId?: string }; coverImage?: { publicId?: string } }>();
  if (!current) throw ApiError.notFound("User not found");
  const previousPublicId = current[field]?.publicId;

  const asset = await uploadToCloudinary({
    path: file.path,
    resourceType: "image",
    folder: field === "avatar" ? "avatars" : "covers",
  });

  const updated = await User.findByIdAndUpdate(
    authUser._id,
    { $set: { [field]: { url: asset.url, publicId: asset.publicId } } },
    { new: true }
  ).lean<PublicUser>();
  if (!updated) {
    await deleteAssetsQuietly([{ publicId: asset.publicId, resourceType: "image" }]);
    throw ApiError.notFound("User not found");
  }

  await deleteAssetsQuietly([{ publicId: previousPublicId, resourceType: "image" }]);
  sendSuccess(
    res,
    200,
    toPublicUser(updated),
    field === "avatar" ? "Avatar updated successfully" : "Cover image updated successfully"
  );
}

export const updateUserAvatar = (req: Request, res: Response): Promise<void> =>
  replaceProfileImage(req, res, "avatar");
export const updateUserCoverImage = (req: Request, res: Response): Promise<void> =>
  replaceProfileImage(req, res, "coverImage");

export async function getUserChannelProfile(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { username } = usernameParams.parse(req.params);

  const channel = await User.findOne({ username })
    .select("username fullName email avatar coverImage createdAt")
    .lean();
  if (!channel) throw ApiError.notFound("Channel not found");

  const [subscribersCount, channelsSubscribedCount, subscription] = await Promise.all([
    Subscription.countDocuments({ channel: channel._id }),
    Subscription.countDocuments({ subscriber: channel._id }),
    Subscription.exists({ subscriber: viewer._id, channel: channel._id }),
  ]);

  const isSelf = channel._id.equals(viewer._id);
  sendSuccess(
    res,
    200,
    {
      _id: channel._id,
      username: channel.username,
      fullName: channel.fullName,
      // Email addresses are private: only the account owner sees theirs.
      ...(isSelf ? { email: channel.email } : {}),
      avatar: channel.avatar,
      coverImage: channel.coverImage,
      subscribersCount,
      channelsSubscribedCount,
      isSubscribed: Boolean(subscription),
      createdAt: channel.createdAt,
    },
    "Channel profile fetched successfully"
  );
}

export async function getUserWatchHistory(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);

  const record = await User.findById(viewer._id)
    .select("watchHistory")
    .lean<{ watchHistory: Types.ObjectId[] }>();
  // The array is oldest -> newest; show the most recent first.
  const orderedIds = (record?.watchHistory ?? []).slice(-HISTORY_LIMIT).reverse();

  const videos = await Video.find({ _id: { $in: orderedIds }, ...visibleVideoFilter(viewer._id) })
    .select("title description videoFile thumbnail views duration createdAt owner")
    .populate<{ owner: OwnerSummary }>("owner", OWNER_FIELDS)
    .lean();

  const byId = new Map(videos.map((video) => [video._id.toString(), video]));
  const history = orderedIds.flatMap((id) => byId.get(id.toString()) ?? []);

  sendSuccess(res, 200, history, "Watch history fetched successfully");
}
