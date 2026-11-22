import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

/** Assigns a request id (also returned as `X-Request-Id`) and logs one line per finished request. */
export const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const isHealthProbe = req.originalUrl.endsWith("/healthcheck");
    const log = res.statusCode >= 500 ? logger.error : isHealthProbe ? logger.debug : logger.info;
    log("request", {
      requestId,
      method: req.method,
      // Path only: query strings can carry user-entered text.
      path: req.originalUrl.split("?")[0],
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      userId: req.user?._id.toString(),
    });
  });
  next();
};
