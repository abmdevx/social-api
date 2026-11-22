import { apiClient, unwrap } from "./client";
import type { ApiResponse, PlaylistDetail, PlaylistSummary } from "@/types/models";

export async function getPlaylists(userId: string): Promise<PlaylistSummary[]> {
  return unwrap(
    await apiClient.get<ApiResponse<PlaylistSummary[]>>(`/playlists/users/${userId}/playlists`)
  );
}

export async function getPlaylist(playlistId: string): Promise<PlaylistDetail> {
  return unwrap(await apiClient.get<ApiResponse<PlaylistDetail>>(`/playlists/p/${playlistId}`));
}

export async function createPlaylist(name: string, description: string): Promise<PlaylistSummary> {
  const result = unwrap(
    await apiClient.post<ApiResponse<{ playlist: PlaylistSummary }>>("/playlists/create-playlist", {
      name,
      description,
    })
  );
  return result.playlist;
}

export async function updatePlaylist(
  playlistId: string,
  name: string,
  description: string
): Promise<PlaylistDetail> {
  return unwrap(
    await apiClient.patch<ApiResponse<PlaylistDetail>>(`/playlists/p/${playlistId}`, {
      name,
      description,
    })
  );
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  await apiClient.delete(`/playlists/p/${playlistId}`);
}

export async function addVideoToPlaylist(
  playlistId: string,
  videoId: string
): Promise<PlaylistDetail> {
  return unwrap(
    await apiClient.put<ApiResponse<PlaylistDetail>>(`/playlists/p/${playlistId}/v/${videoId}`)
  );
}

export async function removeVideoFromPlaylist(
  playlistId: string,
  videoId: string
): Promise<PlaylistDetail> {
  return unwrap(
    await apiClient.delete<ApiResponse<PlaylistDetail>>(`/playlists/p/${playlistId}/v/${videoId}`)
  );
}
