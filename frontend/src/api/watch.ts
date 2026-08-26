import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { Comment, CommentPage } from "../types/comment";
import type { Playlist } from "../types/playlist";
import type { Video } from "../types/video";

export async function getVideo(videoId: string) {
  const response = await apiClient.get<ApiResponse<Video>>(`/videos/v/${videoId}`);
  return response.data.data;
}

export async function toggleVideoLike(videoId: string) {
  const response = await apiClient.post<ApiResponse<{ Like: boolean }>>(`/likes/l/${videoId}`);
  return response.data.data.Like;
}

export async function toggleCommentLike(commentId: string) {
  const response = await apiClient.post<ApiResponse<{ Like: boolean }>>(`/likes/c/${commentId}`);
  return response.data.data.Like;
}

export async function getComments(videoId: string, page = 1, limit = 10) {
  const response = await apiClient.get<ApiResponse<CommentPage>>(`/comments/c/${videoId}`, { params: { page, limit } });
  return response.data.data;
}

export async function addComment(videoId: string, content: string) {
  const response = await apiClient.post<ApiResponse<Comment>>(`/comments/c/${videoId}/add-comment`, { content });
  return response.data.data;
}

export async function updateComment(commentId: string, videoId: string, content: string) {
  const response = await apiClient.patch<ApiResponse<Comment>>(`/comments/c/${commentId}/v/${videoId}/update-comment`, { updatedCommentContent: content });
  return response.data.data;
}

export async function deleteComment(commentId: string, videoId: string) {
  await apiClient.delete<ApiResponse<unknown>>(`/comments/c/${commentId}/v/${videoId}/delete-comment`);
}

export async function getUserPlaylists(userId: string) {
  const response = await apiClient.get<ApiResponse<Playlist[]>>(`/playlists/users/${userId}/playlists`);
  return response.data.data;
}

export async function addVideoToPlaylist(playlistId: string, videoId: string) {
  const response = await apiClient.put<ApiResponse<Playlist>>(`/playlists/p/${playlistId}/v/${videoId}`);
  return response.data.data;
}

export async function toggleSubscription(channelId: string) {
  const response = await apiClient.post<ApiResponse<{ subscribed: boolean }>>(`/subscriptions/c/${channelId}`);
  return response.data.data.subscribed;
}

export async function getSubscriberInfo(channelId: string) {
  const response = await apiClient.get<ApiResponse<{ subscriberCount: number; subscribers: Array<{ _id: string }> }>>(`/subscriptions/c/${channelId}`);
  return response.data.data;
}
