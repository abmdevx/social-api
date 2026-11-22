import { apiClient, unwrap } from "./client";
import type { ApiResponse, StudioStats, StudioVideo } from "@/types/models";

export async function getStudioStats(): Promise<StudioStats> {
  return unwrap(await apiClient.get<ApiResponse<StudioStats>>("/dashboard/stats"));
}

export async function getStudioVideos(): Promise<StudioVideo[]> {
  return unwrap(await apiClient.get<ApiResponse<StudioVideo[]>>("/dashboard/videos"));
}

export interface UploadInput {
  video: File;
  thumbnail?: File;
  title: string;
  description: string;
}

export async function uploadVideo(
  input: UploadInput,
  onProgress: (percent: number) => void
): Promise<StudioVideo> {
  const form = new FormData();
  form.append("video", input.video);
  if (input.thumbnail) form.append("thumbnail", input.thumbnail);
  form.append("title", input.title);
  form.append("description", input.description);
  return unwrap(
    await apiClient.post<ApiResponse<StudioVideo>>("/videos/upload-video", form, {
      timeout: 0, // large uploads on slow links must not be cut off by the default timeout
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    })
  );
}

export async function updateStudioVideo(
  videoId: string,
  title: string,
  description: string
): Promise<StudioVideo> {
  return unwrap(
    await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}`, { title, description })
  );
}

export async function updateStudioThumbnail(
  videoId: string,
  thumbnail: File
): Promise<StudioVideo> {
  const form = new FormData();
  form.append("thumbnail", thumbnail);
  return unwrap(
    await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}/thumbnail`, form, {
      timeout: 120_000,
    })
  );
}

export async function setStudioPublished(
  videoId: string,
  isPublished: boolean
): Promise<StudioVideo> {
  return unwrap(
    await apiClient.patch<ApiResponse<StudioVideo>>(`/videos/v/${videoId}/publish`, { isPublished })
  );
}

export async function deleteStudioVideo(videoId: string): Promise<void> {
  await apiClient.delete("/videos/delete-videos", { data: { videoIds: [videoId] } });
}
