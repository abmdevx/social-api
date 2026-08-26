import type { MediaAsset } from "./api";

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: MediaAsset;
  coverImage?: MediaAsset;
  watchHistory?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  newAccessToken: string;
  newRefreshToken: string;
}
