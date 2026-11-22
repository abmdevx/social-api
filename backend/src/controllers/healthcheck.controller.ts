import type { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";

const CONNECTED = 1;

export function healthcheck(_req: Request, res: Response): void {
  if (mongoose.connection.readyState !== CONNECTED) {
    throw new ApiError(503, "Database not connected");
  }
  sendSuccess(
    res,
    200,
    { status: "ok", uptimeSeconds: Math.round(process.uptime()) },
    "Server is running"
  );
}
