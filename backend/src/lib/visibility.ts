import type { FilterQuery, Types } from "mongoose";
import type { IVideo } from "../models/video.model.js";

/** A video is visible when it is published, or when the viewer owns it. */
export function visibleVideoFilter(viewerId: Types.ObjectId): FilterQuery<IVideo> {
  return { $or: [{ isPublished: true }, { owner: viewerId }] };
}
