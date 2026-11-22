import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/models";

/** Fired when the session can no longer be refreshed; the auth context listens for it. */
export const UNAUTHORIZED_EVENT = "streamline:unauthorized";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

/**
 * Authentication lives in httpOnly cookies set by the API, so no token ever touches JavaScript
 * (nothing in localStorage for an XSS bug to steal).
 */
export const apiClient = axios.create({ baseURL, withCredentials: true, timeout: 30_000 });

/** Used for the refresh call itself so it never recurses into the interceptor below. */
const bareClient = axios.create({ baseURL, withCredentials: true, timeout: 15_000 });

const NO_REFRESH_PATHS = ["/users/login", "/users/register", "/users/refresh-token"];

let refreshInFlight: Promise<void> | null = null;

/**
 * Refresh tokens are single-use: the API rotates them and treats a reused one as theft. That makes
 * concurrent refreshes dangerous, so exactly one runs per tab (shared promise) and, where the Web
 * Locks API exists, one at a time across tabs (they share the same cookie).
 */
export function refreshSession(): Promise<void> {
  refreshInFlight ??= (async () => {
    const run = async () => {
      await bareClient.post("/users/refresh-token");
    };
    try {
      if (typeof navigator !== "undefined" && "locks" in navigator) {
        await navigator.locks.request("streamline:refresh", run);
      } else {
        await run();
      }
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error;
    const config = error.config as RetriableConfig | undefined;
    const skip =
      !config || config._retried || NO_REFRESH_PATHS.some((path) => config.url?.includes(path));
    if (error.response?.status !== 401 || skip) throw error;

    config._retried = true;
    try {
      await refreshSession();
    } catch {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      throw error;
    }
    return apiClient(config);
  }
);

/** Unwraps the `{ data }` envelope. */
export const unwrap = <T>(response: AxiosResponse<ApiResponse<T>>): T => response.data.data;
