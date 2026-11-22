import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { getLikeSummaries, summaryFor } from "../services/like.service.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  deleteTweetsBody,
  listTweetsQuery,
  tweetBody,
  tweetParams,
} from "../validators/tweet.validators.js";

const TWEET_LIST_LIMIT = 100;

interface TweetWithOwner {
  _id: Types.ObjectId;
  content: string;
  owner: OwnerSummary;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTweet(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { content } = tweetBody.parse(req.body);

  const tweet = await Tweet.create({ owner: user._id, content });
  sendSuccess(
    res,
    201,
    {
      _id: tweet._id,
      content: tweet.content,
      owner: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
      likesCount: 0,
      isLiked: false,
    },
    "Tweet created successfully"
  );
}

/** Tweets of `?userId=` when given, otherwise the caller's own (the original behaviour). */
export async function getUserTweets(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { userId } = listTweetsQuery.parse(req.query);
  const ownerId = userId ? new Types.ObjectId(userId) : viewer._id;

  const tweets = await Tweet.find({ owner: ownerId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(TWEET_LIST_LIMIT)
    .populate<{ owner: OwnerSummary }>("owner", OWNER_FIELDS)
    .lean<TweetWithOwner[]>();

  const likes = await getLikeSummaries(
    "tweet",
    tweets.map((tweet) => tweet._id),
    viewer._id
  );
  sendSuccess(
    res,
    200,
    tweets.map((tweet) => ({ ...tweet, ...summaryFor(likes, tweet._id) })),
    "Tweets fetched successfully"
  );
}

export async function updateTweet(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { tweetId } = tweetParams.parse(req.params);
  const { content } = tweetBody.parse(req.body);

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: user._id },
    { $set: { content } },
    { new: true, runValidators: true }
  ).lean();
  if (!tweet) throw ApiError.notFound("Tweet not found, or you are not its author");

  const likes = await getLikeSummaries("tweet", [tweet._id], user._id);
  sendSuccess(
    res,
    200,
    {
      ...tweet,
      owner: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      ...summaryFor(likes, tweet._id),
    },
    "Tweet updated successfully"
  );
}

export async function deleteTweet(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { tweetId } = tweetParams.parse(req.params);

  const deleted = await Tweet.findOneAndDelete({ _id: tweetId, owner: user._id }).lean();
  if (!deleted) throw ApiError.notFound("Tweet not found, or you are not its author");

  await Like.deleteMany({ tweet: deleted._id });
  sendSuccess(res, 200, deleted, "Tweet deleted successfully");
}

export async function deleteTweets(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { tweetIds } = deleteTweetsBody.parse(req.body);

  const owned = await Tweet.find({ _id: { $in: tweetIds }, owner: user._id })
    .select("_id")
    .lean();
  if (owned.length === 0) throw ApiError.notFound("No matching tweets found among yours");

  const ids = owned.map((tweet) => tweet._id);
  const { deletedCount } = await Tweet.deleteMany({ _id: { $in: ids }, owner: user._id });
  await Like.deleteMany({ tweet: { $in: ids } });

  sendSuccess(res, 200, { deletedCount }, "Selected tweets deleted successfully");
}
