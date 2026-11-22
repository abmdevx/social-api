import { apiClient, unwrap } from "./client";
import type {
  ApiResponse,
  LikeState,
  Page,
  SortDirection,
  Video,
  VideoDetail,
  VideoSortBy,
} from "@/types/models";

export interface VideoQuery {
  page?: number;
  limit?: number;
  query?: string;
  userId?: string;
  sortBy?: VideoSortBy;
  sortType?: SortDirection;
}

export async function getVideos(params: VideoQuery): Promise<Page<Video>> {
  return unwrap(
    await apiClient.get<ApiResponse<Page<Video>>>("/videos/get-all-videos", { params })
  );
}

export async function getVideo(videoId: string): Promise<VideoDetail> {
  return unwrap(await apiClient.get<ApiResponse<VideoDetail>>(`/videos/v/${videoId}`));
}

export async function toggleVideoLike(videoId: string): Promise<LikeState> {
  return unwrap(await apiClient.post<ApiResponse<LikeState>>(`/likes/l/${videoId}`));
}

export async function getLikedVideos(): Promise<Video[]> {
  return unwrap(await apiClient.get<ApiResponse<Video[]>>("/likes/get-liked-videos"));
}
