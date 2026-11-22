/** Mirrors the JSON produced by the backend (see backend/openapi.yaml). */

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface MediaAsset {
  url: string;
  publicId: string;
}

/** The public face of a user embedded in other resources. */
export interface Owner {
  _id: string;
  username: string;
  fullName: string;
  avatar?: MediaAsset;
}

export interface User extends Owner {
  email: string;
  coverImage?: MediaAsset;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResult {
  user: User;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  videoFile?: MediaAsset;
  thumbnail?: MediaAsset;
  views: number;
  duration?: number;
  createdAt?: string;
  owner: Owner;
}

/** Single-video response: owner and like state are enriched for the viewer. */
export interface VideoDetail extends Omit<Video, "owner"> {
  likesCount: number;
  isLiked: boolean;
  owner: Owner & { subscribersCount: number; isSubscribed: boolean };
}

export interface Page<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type VideoSortBy = "createdAt" | "views" | "duration" | "title";
export type SortDirection = "asc" | "desc";

export interface LikeState {
  liked: boolean;
  likesCount: number;
}

export interface Comment {
  _id: string;
  content: string;
  video: string;
  owner: Owner;
  likesCount?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentPage {
  comments: Comment[];
  page: number;
  limit: number;
  totalComments: number;
  totalPages: number;
}

export interface Tweet {
  _id: string;
  content: string;
  owner: Owner;
  likesCount?: number;
  isLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel extends Owner {
  email?: string;
  coverImage?: MediaAsset;
  subscribersCount: number;
  channelsSubscribedCount: number;
  isSubscribed: boolean;
  createdAt?: string;
}

/** Playlist as listed: videos are ids. */
export interface PlaylistSummary {
  _id: string;
  owner: string;
  playlistName: string;
  playlistDescription?: string;
  videos: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Playlist as opened: videos are expanded (and already filtered to what the viewer may see). */
export interface PlaylistDetail extends Omit<PlaylistSummary, "videos"> {
  videos: Video[];
}

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
  duration?: number;
  views: number;
  isPublished: boolean;
  createdAt?: string;
}
