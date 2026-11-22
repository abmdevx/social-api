import { Schema, model, type Types } from "mongoose";
import { TWEET_MAX_LENGTH } from "../constants.js";

export interface ITweet {
  owner: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const tweetSchema = new Schema<ITweet>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: TWEET_MAX_LENGTH },
  },
  { timestamps: true }
);

tweetSchema.index({ owner: 1, createdAt: -1 });

export const Tweet = model<ITweet>("Tweet", tweetSchema);
