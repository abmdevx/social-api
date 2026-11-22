import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../lib/apiError.js";
import { normalizeError } from "../lib/errorResponse.js";
import { logger } from "../lib/logger.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.path}`));
};

/** Final error handler: every failure leaves the API as the same JSON envelope. */
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const normalized = normalizeError(error);
  const requestId: unknown = res.locals.requestId;

  if (normalized.isServerFault) {
    logger.error("Unhandled error", { requestId, method: req.method, path: req.path, error });
  } else if (normalized.statusCode >= 500) {
    logger.error(normalized.message, { requestId, path: req.path });
  }

  res.status(normalized.statusCode).json({
    statusCode: normalized.statusCode,
    data: null,
    message: normalized.message,
    success: false,
    errors: normalized.errors,
    ...(typeof requestId === "string" ? { requestId } : {}),
  });
};
