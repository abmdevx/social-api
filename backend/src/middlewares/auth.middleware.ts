import type { Request, RequestHandler } from "express";
import { ApiError } from "../lib/apiError.js";
import { extractBearerToken } from "../lib/tokenHash.js";
import { User, type AuthUser } from "../models/user.model.js";
import { ACCESS_COOKIE } from "../services/session.service.js";
import { tokens } from "../services/token.service.js";

function readAccessToken(req: Request): string | undefined {
  const cookie: unknown = req.cookies?.[ACCESS_COOKIE];
  if (typeof cookie === "string" && cookie) return cookie;
  return extractBearerToken(req.header("authorization"));
}

/**
 * Authenticates the request from the `accessToken` cookie or an `Authorization: Bearer` header
 * and attaches the (secret-free) user to `req.user`. Always responds with the same generic 401
 * so callers cannot learn why a token was rejected.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = readAccessToken(req);
  if (!token) throw ApiError.unauthorized();

  let userId: string;
  try {
    userId = tokens.verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await User.findById(userId).select("-watchHistory").lean<AuthUser>();
  if (!user) throw ApiError.unauthorized("Invalid or expired access token");

  req.user = user;
  next();
};

/** Non-optional accessor for handlers that sit behind `requireAuth`. */
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}
