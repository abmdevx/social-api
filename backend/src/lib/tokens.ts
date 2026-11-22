import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { isObjectIdString } from "./objectId.js";

export interface TokenConfig {
  accessSecret: string;
  accessTtlSeconds: number;
  refreshSecret: string;
  refreshTtlSeconds: number;
}

/**
 * JWT helpers with explicit algorithm pinning. Built through a factory so they can be unit
 * tested without loading the environment.
 */
export function createTokens(config: TokenConfig) {
  const algorithm = "HS256" as const;

  function readSubject(token: string, secret: string): string {
    const payload = jwt.verify(token, secret, { algorithms: [algorithm] });
    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !isObjectIdString(payload.sub)
    ) {
      throw new jwt.JsonWebTokenError("invalid token subject");
    }
    return payload.sub;
  }

  return {
    signAccessToken(userId: string): string {
      return jwt.sign({}, config.accessSecret, {
        algorithm,
        subject: userId,
        expiresIn: config.accessTtlSeconds,
      });
    },
    signRefreshToken(userId: string): string {
      // jwtid makes every refresh token unique even when issued within the same second.
      return jwt.sign({}, config.refreshSecret, {
        algorithm,
        subject: userId,
        jwtid: randomUUID(),
        expiresIn: config.refreshTtlSeconds,
      });
    },
    /** Returns the user id (JWT `sub`). Throws a jsonwebtoken error when invalid or expired. */
    verifyAccessToken(token: string): string {
      return readSubject(token, config.accessSecret);
    },
    verifyRefreshToken(token: string): string {
      return readSubject(token, config.refreshSecret);
    },
  };
}
