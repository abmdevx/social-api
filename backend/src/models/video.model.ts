import { Schema, model, type Types } from "mongoose";
import type { MediaAsset } from "./user.model.js";

export interface IVideo {
  videoFile: MediaAsset;
  thumbnail?: { url?: string; publicId?: string };
  owner: Types.ObjectId;
  title: string;
  description?: string;
  duration?: number;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    videoFile: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    thumbnail: { url: { type: String }, publicId: { type: String } },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 5000 },
    duration: { type: Number, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Feed (published, newest first) and studio (one owner, newest first) are the two hot queries.
videoSchema.index({ isPublished: 1, createdAt: -1 });
videoSchema.index({ owner: 1, createdAt: -1 });

export const Video = model<IVideo>("Video", videoSchema);
