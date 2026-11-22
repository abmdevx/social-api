import type { Types } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteAssetsQuietly, type StoredAsset } from "./cloudinary.service.js";

/**
 * Deletes the caller's videos together with everything that points at them (comments, likes,
 * playlist entries, watch-history entries) and finally the media on Cloudinary.
 * Database first, media last: a leaked file costs storage, a dangling record breaks pages.
 * Returns how many videos were deleted.
 */
export async function deleteVideosCascade(
  ownerId: Types.ObjectId,
  requestedIds: string[]
): Promise<number> {
  const videos = await Video.find({ _id: { $in: requestedIds }, owner: ownerId })
    .select("videoFile thumbnail")
    .lean();
  if (videos.length === 0) return 0;

  const videoIds = videos.map((video) => video._id);
  const commentIds = await Comment.distinct("_id", { video: { $in: videoIds } });

  await Promise.all([
    Like.deleteMany({ $or: [{ video: { $in: videoIds } }, { comment: { $in: commentIds } }] }),
    Comment.deleteMany({ video: { $in: videoIds } }),
    Playlist.updateMany({ videos: { $in: videoIds } }, { $pull: { videos: { $in: videoIds } } }),
    User.updateMany(
      { watchHistory: { $in: videoIds } },
      { $pull: { watchHistory: { $in: videoIds } } }
    ),
  ]);
  const { deletedCount } = await Video.deleteMany({ _id: { $in: videoIds }, owner: ownerId });

  const assets: StoredAsset[] = videos.flatMap((video) => [
    { publicId: video.videoFile.publicId, resourceType: "video" as const },
    { publicId: video.thumbnail?.publicId, resourceType: "image" as const },
  ]);
  await deleteAssetsQuietly(assets);

  return deletedCount;
}
