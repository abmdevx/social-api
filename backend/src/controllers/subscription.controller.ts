import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  channelParams,
  listSubscribersQuery,
  subscriberParams,
} from "../validators/social.validators.js";

const isDuplicateKey = (error: unknown): boolean =>
  typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000;

export async function toggleSubscription(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { channelId } = channelParams.parse(req.params);

  if (user._id.equals(channelId))
    throw ApiError.badRequest("You cannot subscribe to your own channel");
  if (!(await User.exists({ _id: channelId }))) throw ApiError.notFound("Channel not found");

  const key = { subscriber: user._id, channel: new Types.ObjectId(channelId) };
  const removed = await Subscription.deleteOne(key);

  let subscribed = false;
  if (removed.deletedCount === 0) {
    try {
      await Subscription.create(key);
    } catch (error) {
      if (!isDuplicateKey(error)) throw error;
    }
    subscribed = true;
  }

  const subscribersCount = await Subscription.countDocuments({ channel: key.channel });
  sendSuccess(
    res,
    200,
    { subscribed, subscribersCount },
    subscribed ? "Subscribed" : "Unsubscribed"
  );
}

export async function getUserChannelSubscribers(req: Request, res: Response): Promise<void> {
  getAuthUser(req);
  const { channelId } = channelParams.parse(req.params);
  const { limit } = listSubscribersQuery.parse(req.query);

  if (!(await User.exists({ _id: channelId }))) throw ApiError.notFound("Channel not found");

  const [subscriberCount, rows] = await Promise.all([
    Subscription.countDocuments({ channel: channelId }),
    Subscription.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate<{ subscriber: OwnerSummary }>("subscriber", OWNER_FIELDS)
      .lean(),
  ]);

  sendSuccess(
    res,
    200,
    { subscriberCount, subscribers: rows.map((row) => row.subscriber) },
    "Subscribers fetched successfully"
  );
}

/** Subscription lists are private: only the account owner may read their own. */
export async function getSubscribedChannels(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { subscriberId } = subscriberParams.parse(req.params);
  const { limit } = listSubscribersQuery.parse(req.query);

  if (!user._id.equals(subscriberId)) {
    throw ApiError.forbidden("You can only view your own subscriptions");
  }

  const [subscribedChannelsCount, rows] = await Promise.all([
    Subscription.countDocuments({ subscriber: user._id }),
    Subscription.find({ subscriber: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate<{ channel: OwnerSummary }>("channel", OWNER_FIELDS)
      .lean(),
  ]);

  sendSuccess(
    res,
    200,
    { subscribedChannelsCount, channels: rows.map((row) => row.channel) },
    "Subscribed channels fetched successfully"
  );
}
