import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Video } from "../types/video";
import type { Channel } from "../types/channel";

export async function getWatchHistory() {
  const response = await apiClient.get<ApiResponse<Video[]>>("/users/history");
  return response.data.data;
}

export async function getLikedVideos() {
  const response = await apiClient.get<ApiResponse<Video[]>>("/likes/get-liked-videos");
  return response.data.data;
}

export async function getSubscribedChannels(userId: string) {
  const response = await apiClient.get<ApiResponse<{ subscribedChannelsCount: number; channels: Channel[] }>>(`/subscriptions/u/${userId}`);
  return response.data.data;
}
