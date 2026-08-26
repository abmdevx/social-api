import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Playlist } from "../types/playlist";
import axios from "axios";

export async function getPlaylists(userId: string) {
  try {
    const response = await apiClient.get<ApiResponse<Playlist[]>>(`/playlists/users/${userId}/playlists`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return [];
    throw error;
  }
}

export async function getPlaylist(playlistId: string) {
  const response = await apiClient.get<ApiResponse<Playlist>>(`/playlists/p/${playlistId}`);
  return response.data.data;
}

export async function createPlaylist(name: string, description: string, videoIds: string[]) {
  const response = await apiClient.post<ApiResponse<{ playlist: Playlist }>>("/playlists/create-playlist", { name, description, videoIds });
  return response.data;
}

export async function updatePlaylist(playlistId: string, name: string, description: string) {
  const response = await apiClient.patch<ApiResponse<Playlist>>(`/playlists/p/${playlistId}`, { name, description });
  return response.data.data;
}

export async function deletePlaylist(playlistId: string) {
  const response = await apiClient.delete<ApiResponse<Playlist>>(`/playlists/p/${playlistId}`);
  return response.data.data;
}

export async function removeVideoFromPlaylist(playlistId: string, videoId: string) {
  const response = await apiClient.delete<ApiResponse<Playlist>>(`/playlists/p/${playlistId}/v/${videoId}`);
  return response.data.data;
}
