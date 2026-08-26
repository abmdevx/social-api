import type { MediaAsset } from "./api";

export interface Channel {
  _id: string;
  username: string;
  fullName: string;
  email?: string;
  avatar?: MediaAsset;
  coverImage?: MediaAsset;
  subscribersCount: number;
  ChannelsSubscribed: number;
  isSubscribed: boolean;
  createdAt?: string;
}
