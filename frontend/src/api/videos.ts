import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { VideoPage } from "../types/video";

export async function getVideos(params: { page?: number; limit?: number; query?: string; sortBy?: "createdAt" | "views" | "duration" | "title"; sortType?: "asc" | "desc" }) {
  const response = await apiClient.get<ApiResponse<VideoPage>>("/videos/get-all-videos", { params });
  return response.data.data;
}
