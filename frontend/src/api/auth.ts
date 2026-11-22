import { apiClient, unwrap } from "./client";
import type { ApiResponse, LoginResult, User } from "@/types/models";

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

export async function login({ identifier, password }: LoginInput): Promise<User> {
  const body = identifier.includes("@")
    ? { email: identifier, password }
    : { username: identifier, password };
  return unwrap(await apiClient.post<ApiResponse<LoginResult>>("/users/login", body)).user;
}

export async function register(input: RegisterInput): Promise<string> {
  const form = new FormData();
  form.append("username", input.username);
  form.append("email", input.email);
  form.append("fullName", input.fullName);
  form.append("password", input.password);
  form.append("avatar", input.avatar);
  if (input.coverImage) form.append("coverImage", input.coverImage);
  const response = await apiClient.post<ApiResponse<User>>("/users/register", form, {
    timeout: 120_000,
  });
  return response.data.message;
}

export async function getCurrentUser(): Promise<User> {
  return unwrap(await apiClient.get<ApiResponse<User>>("/users/get-current-user"));
}

export async function logout(): Promise<void> {
  await apiClient.post("/users/logout");
}
