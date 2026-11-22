import { ZodError } from "zod";
import { ApiError, type ErrorDetail } from "./apiError.js";

export interface NormalizedError {
  statusCode: number;
  message: string;
  errors: ErrorDetail[];
  /** True when the failure is an unexpected server fault that should be logged with a stack trace. */
  isServerFault: boolean;
}

interface ErrorLike {
  name?: unknown;
  code?: unknown;
  type?: unknown;
  status?: unknown;
  statusCode?: unknown;
  message?: unknown;
  path?: unknown;
  field?: unknown;
  keyPattern?: unknown;
  errors?: unknown;
}

const asRecord = (value: unknown): ErrorLike =>
  typeof value === "object" && value !== null ? (value as ErrorLike) : {};

const fail = (
  statusCode: number,
  message: string,
  errors: ErrorDetail[] = []
): NormalizedError => ({
  statusCode,
  message,
  errors,
  isServerFault: false,
});

/**
 * Maps any thrown value to a safe HTTP error. Library errors are recognised structurally
 * (name / code) so this module stays free of mongoose, multer and jsonwebtoken imports.
 */
export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) return fail(error.statusCode, error.message, error.errors);

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    const first = details[0];
    const message = first
      ? first.path
        ? `${first.path}: ${first.message}`
        : first.message
      : "Invalid request";
    return fail(400, message, details);
  }

  const e = asRecord(error);

  // body-parser (express.json / urlencoded)
  if (e.type === "entity.too.large") return fail(413, "Request body is too large");
  if (e.type === "entity.parse.failed") return fail(400, "Request body is not valid JSON");

  // multer
  if (e.name === "MulterError") {
    switch (e.code) {
      case "LIMIT_FILE_SIZE":
        return fail(413, "Uploaded file is too large");
      case "LIMIT_UNEXPECTED_FILE":
        return fail(
          400,
          `Unexpected file field${typeof e.field === "string" ? ` "${e.field}"` : ""}`
        );
      case "LIMIT_FILE_COUNT":
      case "LIMIT_FIELD_COUNT":
      case "LIMIT_PART_COUNT":
        return fail(400, "Too many files or fields in the request");
      default:
        return fail(400, "Invalid file upload");
    }
  }

  // jsonwebtoken
  if (
    e.name === "JsonWebTokenError" ||
    e.name === "TokenExpiredError" ||
    e.name === "NotBeforeError"
  ) {
    return fail(401, "Invalid or expired token");
  }

  // mongoose / MongoDB
  if (e.name === "CastError") {
    return fail(400, `Invalid value for ${typeof e.path === "string" ? e.path : "field"}`);
  }
  if (e.name === "ValidationError" && typeof e.errors === "object" && e.errors !== null) {
    const details = Object.entries(e.errors as Record<string, { message?: string }>).map(
      ([path, issue]) => ({ path, message: issue.message ?? "Invalid value" })
    );
    return fail(400, details[0]?.message ?? "Validation failed", details);
  }
  if (e.code === 11000) {
    const field = Object.keys(asRecord(e.keyPattern) as Record<string, unknown>)[0];
    return fail(409, field ? `${field} is already in use` : "Resource already exists");
  }

  // http-errors style (e.g. from Express itself): trust 4xx statuses only
  const status =
    typeof e.status === "number" ? e.status : typeof e.statusCode === "number" ? e.statusCode : 0;
  if (status >= 400 && status < 500) {
    return fail(status, typeof e.message === "string" ? e.message : "Request failed");
  }

  return { statusCode: 500, message: "Internal server error", errors: [], isServerFault: true };
}
