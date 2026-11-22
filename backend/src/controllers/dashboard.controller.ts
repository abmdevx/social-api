import type { Request, Response } from "express";
import { sendSuccess } from "../lib/apiResponse.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";

export async function getChannelStats(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);

  const [totalSubscribers, [aggregate], videoIds] = await Promise.all([
    Subscription.countDocuments({ channel: user._id }),
    Video.aggregate<{ totalVideos: number; totalViews: number }>([
      { $match: { owner: user._id } },
      { $group: { _id: null, totalVideos: { $sum: 1 }, totalViews: { $sum: "$views" } } },
    ]),
    Video.distinct("_id", { owner: user._id }),
  ]);

  // Likes on this creator's videos, counted through the video index instead of scanning every like.
  const totalLikes = videoIds.length ? await Like.countDocuments({ video: { $in: videoIds } }) : 0;

  sendSuccess(
    res,
    200,
    {
      totalSubscribers,
      stats: { totalVideos: aggregate?.totalVideos ?? 0, totalViews: aggregate?.totalViews ?? 0 },
      likesData: { totalLikes },
    },
    "Channel stats fetched successfully"
  );
}

export async function getChannelVideos(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const videos = await Video.find({ owner: user._id })
    .sort({ createdAt: -1 })
    .select("title description thumbnail duration views isPublished createdAt")
    .lean();

  sendSuccess(res, 200, videos, "Channel videos fetched successfully");
}
