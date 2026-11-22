import type { Types } from "mongoose";
import type { IUser } from "../models/user.model.js";

export type PublicUser = Pick<
  IUser,
  "username" | "email" | "fullName" | "avatar" | "coverImage" | "createdAt" | "updatedAt"
> & { _id: Types.ObjectId };

/** Explicit allow-list: a new column on the user model can never leak into responses by accident. */
export function toPublicUser(user: PublicUser): PublicUser {
  const publicUser: PublicUser = {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  if (user.coverImage) publicUser.coverImage = user.coverImage;
  return publicUser;
}
