import type { RequestHandler } from "express";
import { ApiError } from "../lib/apiError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence in depth for cookie authentication. State-changing requests that carry an
 * `Origin` header must come from an allowed frontend origin. Requests without the header
 * (curl, server-to-server, mobile apps) are not browser-driven, so they are not subject to CSRF.
 */
export function requireTrustedOrigin(allowedOrigins: string[]): RequestHandler {
  const allowed = new Set(allowedOrigins.map((origin) => origin.replace(/\/$/, "")));
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.header("origin");
    if (origin && !allowed.has(origin.replace(/\/$/, ""))) {
      throw ApiError.forbidden("Origin not allowed");
    }
    next();
  };
}
