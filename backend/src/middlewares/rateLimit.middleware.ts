import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../lib/apiError.js";

const windowMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

/** Generous ceiling for the whole API. */
export const apiLimiter = rateLimit({
  windowMs,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => !env.RATE_LIMIT_ENABLED,
  handler: (_req, _res, next) => next(new ApiError(429, "Too many requests. Please slow down.")),
});

/** Tight limit for credential endpoints. Only failed attempts (4xx/5xx) count against it. */
export const authLimiter = rateLimit({
  windowMs,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => !env.RATE_LIMIT_ENABLED,
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many attempts. Please wait a few minutes and try again.")),
});
