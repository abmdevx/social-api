/** Shape of the error envelope produced by the API (see backend/openapi.yaml). */
interface ApiErrorBody {
  message?: unknown;
  errors?: Array<{ path?: unknown; message?: unknown }>;
}

interface AxiosLikeError {
  isAxiosError: true;
  response?: { status?: number; data?: ApiErrorBody };
}

function isAxiosLike(error: unknown): error is AxiosLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { isAxiosError?: unknown }).isAxiosError === true
  );
}

export const FALLBACK_ERROR = "Something went wrong. Please try again.";

export function getErrorMessage(error: unknown, fallback = FALLBACK_ERROR): string {
  if (isAxiosLike(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message) return message;
    return error.response
      ? fallback
      : "Cannot reach the server. Check your connection and try again.";
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosLike(error) ? error.response?.status : undefined;
}

export const isNotFound = (error: unknown): boolean => getErrorStatus(error) === 404;
