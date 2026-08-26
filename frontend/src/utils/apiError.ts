import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
