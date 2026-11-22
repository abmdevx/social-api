import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";
import { hashToken } from "../lib/tokenHash.js";
import { User } from "../models/user.model.js";
import { API_PREFIX } from "../constants.js";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_SECONDS, tokens } from "./token.service.js";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction || env.COOKIE_SAMESITE === "none",
  sameSite: env.COOKIE_SAMESITE,
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

const accessCookie: CookieOptions = { ...baseCookie, path: "/", maxAge: ACCESS_TTL_SECONDS * 1000 };
// The refresh token is only ever needed by the users router, so it is not sent anywhere else.
const refreshCookie: CookieOptions = {
  ...baseCookie,
  path: `${API_PREFIX}/users`,
  maxAge: REFRESH_TTL_SECONDS * 1000,
};

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

/**
 * Issues a fresh access/refresh pair, stores the refresh token's hash and sets both cookies.
 *
 * When `previousHash` is given the write only succeeds if it still matches what is stored,
 * which makes refresh-token rotation atomic: of two concurrent refreshes with the same token
 * exactly one wins, and the other gets `null`.
 */
export async function startSession(
  res: Response,
  userId: string,
  previousHash?: string
): Promise<SessionTokens | null> {
  const session: SessionTokens = {
    accessToken: tokens.signAccessToken(userId),
    refreshToken: tokens.signRefreshToken(userId),
  };
  const filter = previousHash ? { _id: userId, refreshTokenHash: previousHash } : { _id: userId };
  const result = await User.updateOne(filter, {
    $set: { refreshTokenHash: hashToken(session.refreshToken) },
  });
  if (result.matchedCount === 0) return null;

  res.cookie(ACCESS_COOKIE, session.accessToken, accessCookie);
  res.cookie(REFRESH_COOKIE, session.refreshToken, refreshCookie);
  return session;
}

export function clearSessionCookies(res: Response): void {
  const { maxAge: _a, ...access } = accessCookie;
  const { maxAge: _r, ...refresh } = refreshCookie;
  res.clearCookie(ACCESS_COOKIE, access);
  res.clearCookie(REFRESH_COOKIE, refresh);
}
