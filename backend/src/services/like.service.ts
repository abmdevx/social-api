import type { Types } from "mongoose";
import { Like, type ILike } from "../models/like.model.js";

export type LikeTarget = "video" | "comment" | "tweet";

export interface LikeSummary {
  likesCount: number;
  isLiked: boolean;
}

const EMPTY: LikeSummary = { likesCount: 0, isLiked: false };

/** Like counts and "did the viewer like it" for many targets in a single aggregation. */
export async function getLikeSummaries(
  target: LikeTarget,
  ids: Types.ObjectId[],
  viewerId: Types.ObjectId
): Promise<Map<string, LikeSummary>> {
  const summaries = new Map<string, LikeSummary>();
  if (ids.length === 0) return summaries;

  const rows = await Like.aggregate<{ _id: Types.ObjectId; count: number; liked: number }>([
    { $match: { [target]: { $in: ids } } },
    {
      $group: {
        _id: `$${target}`,
        count: { $sum: 1 },
        liked: { $max: { $cond: [{ $eq: ["$likedBy", viewerId] }, 1, 0] } },
      },
    },
  ]);

  for (const row of rows) {
    summaries.set(row._id.toString(), { likesCount: row.count, isLiked: row.liked === 1 });
  }
  return summaries;
}

export function summaryFor(summaries: Map<string, LikeSummary>, id: Types.ObjectId): LikeSummary {
  return summaries.get(id.toString()) ?? EMPTY;
}

function likeKey(
  target: LikeTarget,
  targetId: Types.ObjectId,
  userId: Types.ObjectId
): Pick<ILike, "likedBy"> & Partial<Pick<ILike, LikeTarget>> {
  switch (target) {
    case "video":
      return { likedBy: userId, video: targetId };
    case "comment":
      return { likedBy: userId, comment: targetId };
    case "tweet":
      return { likedBy: userId, tweet: targetId };
  }
}

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;

/**
 * Toggles a like without a read-then-write race: try to remove first; if nothing was removed,
 * create it. A concurrent duplicate create (unique index) simply means it is already liked.
 */
export async function toggleLike(
  target: LikeTarget,
  targetId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<{ liked: boolean; likesCount: number }> {
  const key = likeKey(target, targetId, userId);
  const removed = await Like.deleteOne(key);

  let liked = false;
  if (removed.deletedCount === 0) {
    try {
      await Like.create(key);
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
    }
    liked = true;
  }

  const likesCount = await Like.countDocuments({ [target]: targetId });
  return { liked, likesCount };
}
