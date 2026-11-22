import bcrypt from "bcrypt";
import { Schema, model, type Model, type Types } from "mongoose";

export const BCRYPT_ROUNDS = 12;

export interface MediaAsset {
  url: string;
  publicId: string;
}

export interface IUser {
  username: string;
  email: string;
  fullName: string;
  avatar: MediaAsset;
  coverImage?: { url?: string; publicId?: string };
  watchHistory: Types.ObjectId[];
  /** bcrypt hash. `select: false`, so it is never returned unless explicitly requested. */
  password: string;
  /** SHA-256 of the current refresh token. `select: false`. The raw token is never stored. */
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    avatar: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    coverImage: { url: { type: String }, publicId: { type: String } },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    password: { type: String, required: [true, "password is required"], select: false },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = model<IUser, UserModel>("User", userSchema);

/** Shape attached to `req.user` by the auth middleware (a lean document, no secrets). */
export type AuthUser = Pick<
  IUser,
  "username" | "email" | "fullName" | "avatar" | "coverImage" | "createdAt" | "updatedAt"
> & { _id: Types.ObjectId };
