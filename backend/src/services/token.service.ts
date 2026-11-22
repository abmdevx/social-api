import { env } from "../config/env.js";
import { durationToSeconds } from "../lib/duration.js";
import { createTokens } from "../lib/tokens.js";

export const ACCESS_TTL_SECONDS = durationToSeconds(env.ACCESS_TOKEN_EXPIRY);
export const REFRESH_TTL_SECONDS = durationToSeconds(env.REFRESH_TOKEN_EXPIRY);

export const tokens = createTokens({
  accessSecret: env.ACCESS_TOKEN_SECRET,
  accessTtlSeconds: ACCESS_TTL_SECONDS,
  refreshSecret: env.REFRESH_TOKEN_SECRET,
  refreshTtlSeconds: REFRESH_TTL_SECONDS,
});
