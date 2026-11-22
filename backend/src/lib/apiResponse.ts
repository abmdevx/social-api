import type { Response } from "express";

/** Envelope used by every successful response. The frontend's `ApiResponse<T>` mirrors this. */
export interface ApiResponseBody<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export function buildResponse<T>(statusCode: number, data: T, message: string): ApiResponseBody<T> {
  return { statusCode, data, message, success: statusCode < 400 };
}

export function sendSuccess<T>(res: Response, statusCode: number, data: T, message: string): void {
  res.status(statusCode).json(buildResponse(statusCode, data, message));
}
