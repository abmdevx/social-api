import type { MediaAsset } from "./api";

export interface VideoOwner {
  _id?: string;
  username: string;
  avatar?: MediaAsset;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoFile?: MediaAsset;
  thumbnail?: MediaAsset;
  owner?: VideoOwner | string;
  views: number;
  duration?: number;
  createdAt?: string;
}

export interface VideoPage {
  docs: Video[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}
