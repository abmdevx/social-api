import { z } from "zod";
import { objectId } from "./common.js";

export const channelParams = z.object({ channelId: objectId });
export const subscriberParams = z.object({ subscriberId: objectId });
export const listSubscribersQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const likeVideoParams = z.object({ videoId: objectId });
export const likeCommentParams = z.object({ commentId: objectId });
export const likeTweetParams = z.object({ tweetId: objectId });
export const likedVideosQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
