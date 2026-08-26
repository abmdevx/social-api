import type { MediaAsset } from "./api";

export interface StudioStats {
  totalSubscribers: number;
  stats: { totalVideos: number; totalViews: number };
  likesData: { totalLikes: number };
}

export interface StudioVideo {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: MediaAsset;
  views: number;
  isPublished?: boolean;
  createdAt?: string;
}
