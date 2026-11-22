import { apiClient, unwrap } from "./client";
import type { ApiResponse, Channel, User, Video } from "@/types/models";

export async function updateAccount(fullName: string, email: string): Promise<User> {
  return unwrap(
    await apiClient.patch<ApiResponse<User>>("/users/update-account", { fullName, email })
  );
}

async function uploadImage(
  path: string,
  field: "avatar" | "coverImage",
  file: File
): Promise<User> {
  const form = new FormData();
  form.append(field, file);
  return unwrap(await apiClient.patch<ApiResponse<User>>(path, form, { timeout: 120_000 }));
}

export const updateAvatar = (file: File) => uploadImage("/users/change-avatar", "avatar", file);
export const updateCoverImage = (file: File) =>
  uploadImage("/users/change-cover-image", "coverImage", file);

export async function changePassword(oldPassword: string, newPassword: string): Promise<string> {
  const response = await apiClient.post<ApiResponse<unknown>>("/users/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data.message;
}

export async function getChannel(username: string): Promise<Channel> {
  return unwrap(
    await apiClient.get<ApiResponse<Channel>>(`/users/c/${encodeURIComponent(username)}`)
  );
}

export async function getWatchHistory(): Promise<Video[]> {
  return unwrap(await apiClient.get<ApiResponse<Video[]>>("/users/history"));
}
