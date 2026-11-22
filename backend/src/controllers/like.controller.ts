import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { visibleVideoFilter } from "../lib/visibility.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { toggleLike } from "../services/like.service.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  likeCommentParams,
  likeTweetParams,
  likeVideoParams,
  likedVideosQuery,
} from "../validators/social.validators.js";

export async function toggleVideoLike(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoId } = likeVideoParams.parse(req.params);

  if (!(await Video.exists({ _id: videoId, ...visibleVideoFilter(user._id) }))) {
    throw ApiError.notFound("Video not found");
  }
  const result = await toggleLike("video", new Types.ObjectId(videoId), user._id);
  sendSuccess(res, 200, result, result.liked ? "Video liked" : "Video like removed");
}

export async function toggleCommentLike(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { commentId } = likeCommentParams.parse(req.params);

  // A comment is only reachable through a video the viewer is allowed to see.
  const comment = await Comment.findById(commentId).select("video").lean();
  if (!comment || !(await Video.exists({ _id: comment.video, ...visibleVideoFilter(user._id) }))) {
    throw ApiError.notFound("Comment not found");
  }
  const result = await toggleLike("comment", new Types.ObjectId(commentId), user._id);
  sendSuccess(res, 200, result, result.liked ? "Comment liked" : "Comment like removed");
}

export async function toggleTweetLike(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { tweetId } = likeTweetParams.parse(req.params);

  if (!(await Tweet.exists({ _id: tweetId }))) throw ApiError.notFound("Tweet not found");
  const result = await toggleLike("tweet", new Types.ObjectId(tweetId), user._id);
  sendSuccess(res, 200, result, result.liked ? "Tweet liked" : "Tweet like removed");
}

export async function getLikedVideos(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { limit } = likedVideosQuery.parse(req.query);

  const likes = await Like.find({ likedBy: user._id, video: { $type: "objectId" } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: "video",
      match: visibleVideoFilter(user._id),
      select: "title description videoFile thumbnail views duration createdAt owner",
      populate: { path: "owner", select: OWNER_FIELDS },
    })
    .lean<Array<{ video: { owner: OwnerSummary } | null }>>();

  // Videos that were deleted or unpublished since being liked populate to null.
  sendSuccess(
    res,
    200,
    likes.flatMap((like) => like.video ?? []),
    "Liked videos fetched successfully"
  );
}
