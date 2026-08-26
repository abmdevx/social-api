import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/auth";

export async function updateAccount(fullName: string, email: string) {
  const response = await apiClient.patch<ApiResponse<User>>("/users/update-account", { fullName, email });
  return response.data.data;
}

export async function updateAvatar(avatar: File) {
  const formData = new FormData();
  formData.append("avatar", avatar);
  const response = await apiClient.patch<ApiResponse<User>>("/users/change-avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.data;
}

export async function updateCoverImage(coverImage: File) {
  const formData = new FormData();
  formData.append("coverImage", coverImage);
  const response = await apiClient.patch<ApiResponse<User>>("/users/change-cover-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const response = await apiClient.post<ApiResponse<unknown>>("/users/change-password", { oldPassword, NewPasssword: newPassword });
  return response.data.message;
}
