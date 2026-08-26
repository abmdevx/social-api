import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Channel } from "../types/channel";
import type { Playlist } from "../types/playlist";
import type { Tweet } from "../types/tweet";
import type { VideoPage } from "../types/video";
import axios from "axios";

export async function getChannel(username: string) {
  const response = await apiClient.get<ApiResponse<Channel>>(`/users/c/${encodeURIComponent(username)}`);
  return response.data.data;
}

export async function getChannelVideos(userId: string) {
  const response = await apiClient.get<ApiResponse<VideoPage>>("/videos/get-all-videos", { params: { userId, page: 1, limit: 20, sortBy: "createdAt", sortType: "desc" } });
  return response.data.data.docs || [];
}

export async function getChannelTweets() {
  const response = await apiClient.get<ApiResponse<Tweet[]>>("/tweets/get-tweets");
  return response.data.data;
}

export async function getChannelPlaylists(userId: string) {
  try {
    const response = await apiClient.get<ApiResponse<Playlist[]>>(`/playlists/users/${userId}/playlists`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}
