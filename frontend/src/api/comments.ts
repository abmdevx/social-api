import { apiClient, unwrap } from "./client";
import type { ApiResponse, Comment, CommentPage, LikeState } from "@/types/models";

export async function getComments(videoId: string, page = 1, limit = 10): Promise<CommentPage> {
  return unwrap(
    await apiClient.get<ApiResponse<CommentPage>>(`/comments/c/${videoId}`, {
      params: { page, limit },
    })
  );
}

export async function addComment(videoId: string, content: string): Promise<Comment> {
  return unwrap(
    await apiClient.post<ApiResponse<Comment>>(`/comments/c/${videoId}/add-comment`, { content })
  );
}

export async function updateComment(
  commentId: string,
  videoId: string,
  content: string
): Promise<Comment> {
  return unwrap(
    await apiClient.patch<ApiResponse<Comment>>(
      `/comments/c/${commentId}/v/${videoId}/update-comment`,
      { content }
    )
  );
}

export async function deleteComment(commentId: string, videoId: string): Promise<void> {
  await apiClient.delete(`/comments/c/${commentId}/v/${videoId}/delete-comment`);
}

export async function toggleCommentLike(commentId: string): Promise<LikeState> {
  return unwrap(await apiClient.post<ApiResponse<LikeState>>(`/likes/c/${commentId}`));
}
