import { z } from "zod";
import { TWEET_MAX_LENGTH } from "../constants.js";
import { objectId, text } from "./common.js";

export const tweetParams = z.object({ tweetId: objectId });
export const tweetBody = z.object({ content: text(TWEET_MAX_LENGTH) });
export const listTweetsQuery = z.object({ userId: objectId.optional() });
export const deleteTweetsBody = z.object({
  tweetIds: z
    .array(objectId)
    .min(1)
    .max(100)
    .transform((ids) => [...new Set(ids)]),
});
