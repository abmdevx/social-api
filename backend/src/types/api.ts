import type { Types } from "mongoose";
import type { MediaAsset } from "../models/user.model.js";

/** The public face of a user embedded in other resources (video owner, comment author, ...). */
export interface OwnerSummary {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatar: MediaAsset;
}

export const OWNER_FIELDS = "username fullName avatar";
