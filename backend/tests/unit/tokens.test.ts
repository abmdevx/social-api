// Needs the `jsonwebtoken` dependency (npm install) – it is the only unit test that does.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { createTokens } from "../../src/lib/tokens.js";

const config = {
  accessSecret: "a".repeat(48),
  accessTtlSeconds: 900,
  refreshSecret: "b".repeat(48),
  refreshTtlSeconds: 3600,
};
const USER_ID = "664abc123def456789012346";
const tokens = createTokens(config);

describe("createTokens", () => {
  it("round-trips the user id", () => {
    assert.equal(tokens.verifyAccessToken(tokens.signAccessToken(USER_ID)), USER_ID);
    assert.equal(tokens.verifyRefreshToken(tokens.signRefreshToken(USER_ID)), USER_ID);
  });
  it("keeps access and refresh tokens from being interchangeable", () => {
    assert.throws(() => tokens.verifyAccessToken(tokens.signRefreshToken(USER_ID)));
    assert.throws(() => tokens.verifyRefreshToken(tokens.signAccessToken(USER_ID)));
  });
  it("issues a unique refresh token on every call, even within the same second", () => {
    assert.notEqual(tokens.signRefreshToken(USER_ID), tokens.signRefreshToken(USER_ID));
  });
  it("rejects expired tokens", () => {
    const expired = jwt.sign({}, config.accessSecret, {
      algorithm: "HS256",
      subject: USER_ID,
      expiresIn: -10,
    });
    assert.throws(() => tokens.verifyAccessToken(expired), /expired/i);
  });
  it("rejects the alg=none attack and other algorithms", () => {
    const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(
      JSON.stringify({ sub: USER_ID })
    ).toString("base64url")}.`;
    assert.throws(() => tokens.verifyAccessToken(none));
    const hs512 = jwt.sign({}, config.accessSecret, {
      algorithm: "HS512",
      subject: USER_ID,
      expiresIn: 60,
    });
    assert.throws(() => tokens.verifyAccessToken(hs512));
  });
  it("rejects tokens signed with the wrong secret or carrying a bad subject", () => {
    const forged = jwt.sign({}, "c".repeat(48), {
      algorithm: "HS256",
      subject: USER_ID,
      expiresIn: 60,
    });
    assert.throws(() => tokens.verifyAccessToken(forged));
    const noSubject = jwt.sign({}, config.accessSecret, { algorithm: "HS256", expiresIn: 60 });
    assert.throws(() => tokens.verifyAccessToken(noSubject));
    const badSubject = jwt.sign({}, config.accessSecret, {
      algorithm: "HS256",
      subject: "not-an-id",
      expiresIn: 60,
    });
    assert.throws(() => tokens.verifyAccessToken(badSubject));
  });
});
