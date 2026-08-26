import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "../utils/storage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isRefreshRequest = originalRequest?.url?.includes("/users/refresh-token");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      clearTokens();
      window.dispatchEvent(new Event("auth:unauthorized"));
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const refreshResponse = await apiClient.post("/users/refresh-token", { refreshToken: refreshTokenValue });
      const { newAccessToken, newRefreshToken } = refreshResponse.data.data;
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.dispatchEvent(new Event("auth:unauthorized"));
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
