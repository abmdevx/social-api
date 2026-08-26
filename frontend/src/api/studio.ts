import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { StudioStats, StudioVideo } from "../types/studio";
import axios from "axios";

export async function getStudioStats() {
  const response = await apiClient.get<ApiResponse<StudioStats>>("/dashboard/stats");
  return response.data.data;
}

export async function getStudioVideos() {
  try {
    const response = await apiClient.get<ApiResponse<StudioVideo[]>>("/dashboard/videos");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}

export async function uploadVideo(data: { video: File; thumbnail: File; title: string; description: string }, onUploadProgress: (progress: number) => void) {
  const formData = new FormData();
  formData.append("video", data.video);
  formData.append("thumbnail", data.thumbnail);
  formData.append("title", data.title);
  formData.append("description", data.description);
  const response = await apiClient.post<ApiResponse<StudioVideo>>("/videos/upload-video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => { if (event.total) onUploadProgress(Math.round((event.loaded / event.total) * 100)); },
  });
  return response.data;
}

export async function updateStudioVideo(videoId: string, title: string, description: string) {
  const response = await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}`, { updatedTitle: title, updateddescription: description });
  return response.data.data;
}

export async function updateStudioThumbnail(videoId: string, thumbnail: File) {
  const formData = new FormData();
  formData.append("thumbnail", thumbnail);
  const response = await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}/thumbnail`, formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.data;
}

export async function toggleStudioPublish(videoId: string, isPublishedStatus: boolean) {
  const response = await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}/publish`, { isPublishedStatus });
  return response.data.data;
}

export async function deleteStudioVideo(videoId: string) {
  const response = await apiClient.delete<ApiResponse<unknown>>("/videos/delete-videos", { data: { videoIds: [videoId] } });
  return response.data;
}
