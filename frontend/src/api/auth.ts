import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type { LoginResponse, RefreshResponse, User } from "../types/auth";

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  fullName: string;
  password: string;
  avatar: File;
  coverImage?: File;
}

export async function login(input: LoginInput) {
  const body = input.identifier.includes("@")
    ? { email: input.identifier, password: input.password }
    : { username: input.identifier, password: input.password };
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/users/login", body);
  return response.data.data;
}

export async function register(input: RegisterInput) {
  const formData = new FormData();
  formData.append("username", input.username);
  formData.append("email", input.email);
  formData.append("fullName", input.fullName);
  formData.append("password", input.password);
  formData.append("avatar", input.avatar);
  if (input.coverImage) formData.append("coverImage", input.coverImage);

  const response = await apiClient.post<ApiResponse<User>>("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get<ApiResponse<User>>("/users/get-current-user");
  return response.data.data;
}

export async function refreshToken(refreshTokenValue: string) {
  const response = await apiClient.post<ApiResponse<RefreshResponse>>("/users/refresh-token", {
    refreshToken: refreshTokenValue,
  });
  return response.data.data;
}

export async function logout() {
  await apiClient.post<ApiResponse<unknown>>("/users/logout");
}
