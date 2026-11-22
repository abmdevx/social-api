import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { buildPage, skipFor } from "../lib/pagination.js";
import { visibleVideoFilter } from "../lib/visibility.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { getLikeSummaries, summaryFor } from "../services/like.service.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  commentBody,
  commentParams,
  listCommentsQuery,
  videoParams,
} from "../validators/comment.validators.js";

interface CommentWithOwner {
  _id: Types.ObjectId;
  content: string;
  video: Types.ObjectId;
  owner: OwnerSummary;
  createdAt: Date;
  updatedAt: Date;
}

/** The video must exist and be visible to the viewer (published, or their own). */
async function assertVideoVisible(
  videoId: string,
  viewerId: Types.ObjectId
): Promise<{ owner: Types.ObjectId }> {
  const video = await Video.findOne({ _id: videoId, ...visibleVideoFilter(viewerId) })
    .select("owner")
    .lean();
  if (!video) throw ApiError.notFound("Video not found");
  return video;
}

export async function getVideoComments(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { videoId } = videoParams.parse(req.params);
  const { page, limit } = listCommentsQuery.parse(req.query);
  await assertVideoVisible(videoId, viewer._id);

  const filter = { video: new Types.ObjectId(videoId) };
  const [totalComments, comments] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skipFor(page, limit))
      .limit(limit)
      .populate<{ owner: OwnerSummary }>("owner", OWNER_FIELDS)
      .lean<CommentWithOwner[]>(),
  ]);

  const likes = await getLikeSummaries(
    "comment",
    comments.map((comment) => comment._id),
    viewer._id
  );
  const { totalPages } = buildPage(comments, totalComments, page, limit);

  sendSuccess(
    res,
    200,
    {
      comments: comments.map((comment) => ({ ...comment, ...summaryFor(likes, comment._id) })),
      page,
      limit,
      totalComments,
      totalPages,
    },
    "Comments fetched successfully"
  );
}

export async function addComment(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { videoId } = videoParams.parse(req.params);
  const { content } = commentBody.parse(req.body);
  await assertVideoVisible(videoId, user._id);

  const created = await Comment.create({
    content,
    owner: user._id,
    video: new Types.ObjectId(videoId),
  });
  sendSuccess(
    res,
    201,
    {
      _id: created._id,
      content: created.content,
      video: created.video,
      owner: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      likesCount: 0,
      isLiked: false,
    },
    "Comment added successfully"
  );
}

export async function updateComment(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { commentId, videoId } = commentParams.parse(req.params);
  const { content } = commentBody.parse(req.body);

  const updated = await Comment.findOneAndUpdate(
    { _id: commentId, video: videoId, owner: user._id },
    { $set: { content } },
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw ApiError.notFound("Comment not found, or you are not its author");

  const likes = await getLikeSummaries("comment", [updated._id], user._id);
  sendSuccess(
    res,
    200,
    {
      ...updated,
      owner: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      ...summaryFor(likes, updated._id),
    },
    "Comment updated successfully"
  );
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { commentId, videoId } = commentParams.parse(req.params);

  const comment = await Comment.findOne({ _id: commentId, video: videoId }).select("owner").lean();
  if (!comment) throw ApiError.notFound("Comment not found");

  // The comment's author and the video's owner (moderation) may delete it.
  if (!comment.owner.equals(user._id)) {
    const video = await Video.findById(videoId).select("owner").lean();
    if (!video?.owner.equals(user._id))
      throw ApiError.forbidden("You are not allowed to delete this comment");
  }

  await Promise.all([
    Comment.deleteOne({ _id: comment._id }),
    Like.deleteMany({ comment: comment._id }),
  ]);
  sendSuccess(res, 200, {}, "Comment deleted successfully");
}
