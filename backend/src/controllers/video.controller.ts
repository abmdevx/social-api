import type { Request, Response } from "express";
import { Types, type FilterQuery } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { escapeRegex } from "../lib/escapeRegex.js";
import { buildPage, skipFor } from "../lib/pagination.js";
import { visibleVideoFilter } from "../lib/visibility.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { getUploadedFile } from "../middlewares/upload.middleware.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Video, type IVideo } from "../models/video.model.js";
import {
  deleteAssetsQuietly,
  uploadAllOrNone,
  uploadToCloudinary,
  type UploadJob,
} from "../services/cloudinary.service.js";
import { getLikeSummaries, summaryFor } from "../services/like.service.js";
import { deleteVideosCascade } from "../services/video.service.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  deleteVideosBody,
  listVideosQuery,
  publishBody,
  updateVideoBody,
  uploadVideoBody,
  videoIdParams,
} from "../validators/video.validators.js";

const HISTORY_CAP = 200;
/** Fields the studio needs to manage a video. */
const STUDIO_FIELDS = "title description thumbnail duration views isPublished createdAt";

export async function getAllVideos(req: Request, res: Response): Promise<void> {
  getAuthUser(req);
  const { page, limit, query, sortBy, sortType, userId } = listVideosQuery.parse(req.query);

  const match: FilterQuery<IVideo> = { isPublished: true };
  if (userId) match.owner = new Types.ObjectId(userId);
  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    match.$or = [{ title: pattern }, { description: pattern }];
  }

  const direction = sortType === "asc" ? 1 : -1;
  const [totalDocs, docs] = await Promise.all([
    Video.countDocuments(match),
    // Sort and paginate on the indexed collection first; only the page's rows are joined to users.
    Video.aggregate([
      { $match: match },
      { $sort: { [sortBy]: direction, _id: -1 } },
      { $skip: skipFor(page, limit) },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          title: 1,
          description: 1,
          videoFile: 1,
          thumbnail: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          owner: 1,
        },
      },
    ]),
  ]);

  sendSuccess(res, 200, buildPage(docs, totalDocs, page, limit), "Videos fetched successfully");
}

export async function publishAVideo(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { title, description } = uploadVideoBody.parse(req.body);

  const videoFile = getUploadedFile(req, "video");
  const thumbnailFile = getUploadedFile(req, "thumbnail");
  if (!videoFile) throw ApiError.badRequest("A video file is required");

  const jobs: UploadJob[] = [{ path: videoFile.path, resourceType: "video", folder: "videos" }];
  if (thumbnailFile)
    jobs.push({ path: thumbnailFile.path, resourceType: "image", folder: "thumbnails" });
  const [videoUpload, thumbnailUpload] = await uploadAllOrNone(jobs);
  if (!videoUpload) throw new ApiError(502, "Media upload failed. Please try again.");

  try {
    const video = await Video.create({
      owner: user._id,
      videoFile: { url: videoUpload.url, publicId: videoUpload.publicId },
      ...(thumbnailUpload
        ? { thumbnail: { url: thumbnailUpload.url, publicId: thumbnailUpload.publicId } }
        : {}),
      title: title ?? new Date().toLocaleDateString("en-GB"),
      description: description ?? "",
      duration: Math.floor(videoUpload.duration ?? 0),
    });
    sendSuccess(res, 201, video, "Video uploaded successfully");
  } catch (error) {
    await deleteAssetsQuietly([
      { publicId: videoUpload.publicId, resourceType: "video" },
      { publicId: thumbnailUpload?.publicId, resourceType: "image" },
    ]);
    throw error;
  }
}

export async function getVideoById(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { videoId } = videoIdParams.parse(req.params);

  const video = await Video.findOne({ _id: videoId, ...visibleVideoFilter(viewer._id) })
    .populate<{ owner: OwnerSummary }>("owner", OWNER_FIELDS)
    .lean();
  if (!video) throw ApiError.notFound("Video not found");

  const ownerId = video.owner._id;
  const isOwner = ownerId.equals(viewer._id);

  const [likeSummaries, subscribersCount, subscription, counted] = await Promise.all([
    getLikeSummaries("video", [video._id], viewer._id),
    Subscription.countDocuments({ channel: ownerId }),
    isOwner ? null : Subscription.exists({ subscriber: viewer._id, channel: ownerId }),
    // Creators previewing their own upload should not inflate their view count.
    isOwner
      ? null
      : Video.findByIdAndUpdate(video._id, { $inc: { views: 1 } }, { new: true })
          .select("views")
          .lean(),
  ]);

  // Move the video to the end (= most recent) of the viewer's history, capped in size.
  await User.updateOne({ _id: viewer._id }, { $pull: { watchHistory: video._id } });
  await User.updateOne(
    { _id: viewer._id },
    { $push: { watchHistory: { $each: [video._id], $slice: -HISTORY_CAP } } }
  );

  const { likesCount, isLiked } = summaryFor(likeSummaries, video._id);
  sendSuccess(
    res,
    200,
    {
      ...video,
      views: counted?.views ?? video.views,
      likesCount,
      isLiked,
      owner: { ...video.owner, subscribersCount, isSubscribed: Boolean(subscription) },
    },
    "Video fetched successfully"
  );
}

export async function updateVideo(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoId } = videoIdParams.parse(req.params);
  const changes = updateVideoBody.parse(req.body);

  // Ownership is part of the filter itself, so another user's video can never match.
  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: user._id },
    { $set: changes },
    { new: true, runValidators: true }
  )
    .select(STUDIO_FIELDS)
    .lean();
  if (!video) throw ApiError.notFound("Video not found");

  sendSuccess(res, 200, video, "Video details updated successfully");
}

export async function updateVideoThumbnail(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoId } = videoIdParams.parse(req.params);
  const file = getUploadedFile(req, "thumbnail");
  if (!file) throw ApiError.badRequest("A thumbnail image is required");

  // Verify ownership before spending an upload on it.
  const current = await Video.findOne({ _id: videoId, owner: user._id }).select("thumbnail").lean();
  if (!current) throw ApiError.notFound("Video not found");

  const asset = await uploadToCloudinary({
    path: file.path,
    resourceType: "image",
    folder: "thumbnails",
  });

  const updated = await Video.findOneAndUpdate(
    { _id: videoId, owner: user._id },
    { $set: { thumbnail: { url: asset.url, publicId: asset.publicId } } },
    { new: true }
  )
    .select(STUDIO_FIELDS)
    .lean();
  if (!updated) {
    await deleteAssetsQuietly([{ publicId: asset.publicId, resourceType: "image" }]);
    throw ApiError.notFound("Video not found");
  }

  await deleteAssetsQuietly([{ publicId: current.thumbnail?.publicId, resourceType: "image" }]);
  sendSuccess(res, 200, updated, "Thumbnail updated successfully");
}

export async function togglePublishStatus(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoId } = videoIdParams.parse(req.params);
  const { isPublished } = publishBody.parse(req.body);

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: user._id },
    { $set: { isPublished } },
    { new: true }
  )
    .select(STUDIO_FIELDS)
    .lean();
  if (!video) throw ApiError.notFound("Video not found");

  sendSuccess(res, 200, video, isPublished ? "Video published" : "Video unpublished");
}

export async function deleteVideos(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoIds } = deleteVideosBody.parse(req.body);

  const deletedCount = await deleteVideosCascade(user._id, videoIds);
  if (deletedCount === 0) throw ApiError.notFound("No matching videos found among your uploads");

  sendSuccess(res, 200, { deletedCount }, "Selected videos deleted successfully");
}
