import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EnvError, parseEnv } from "../../src/config/env.schema.js";

const valid = {
  MONGO_URI: "mongodb://127.0.0.1:27017",
  ACCESS_TOKEN_SECRET: "a".repeat(48),
  REFRESH_TOKEN_SECRET: "b".repeat(48),
  CLOUDINARY_CLOUD_NAME: "cloud",
  CLOUDINARY_API_KEY: "key",
  CLOUDINARY_API_SECRET: "secret",
};

const problems = (source: Record<string, string | undefined>): string[] => {
  try {
    parseEnv(source);
  } catch (error) {
    assert.ok(error instanceof EnvError);
    return error.problems;
  }
  return [];
};

describe("parseEnv", () => {
  it("applies safe defaults", () => {
    const env = parseEnv(valid);
    assert.equal(env.NODE_ENV, "development");
    assert.equal(env.PORT, 8000);
    assert.equal(env.DB_NAME, "streamline");
    assert.equal(env.ACCESS_TOKEN_EXPIRY, "15m");
    assert.equal(env.REFRESH_TOKEN_EXPIRY, "7d");
    assert.equal(env.COOKIE_SAMESITE, "lax");
    assert.equal(env.RATE_LIMIT_ENABLED, true);
    assert.deepEqual(env.CORS_ORIGIN, ["http://localhost:5173"]);
    assert.equal(env.enableApiDocs, true);
    assert.equal(env.maxImageBytes, 5 * 1024 * 1024);
    assert.equal(env.maxVideoBytes, 100 * 1024 * 1024);
  });
  it("disables API docs by default in production but allows opting in", () => {
    assert.equal(parseEnv({ ...valid, NODE_ENV: "production" }).enableApiDocs, false);
    assert.equal(
      parseEnv({ ...valid, NODE_ENV: "production", ENABLE_API_DOCS: "true" }).enableApiDocs,
      true
    );
  });
  it("parses a comma separated origin list and strips trailing slashes", () => {
    const env = parseEnv({ ...valid, CORS_ORIGIN: " https://a.io/ , https://b.io " });
    assert.deepEqual(env.CORS_ORIGIN, ["https://a.io", "https://b.io"]);
  });
  it("treats blank optional values as unset", () => {
    const env = parseEnv({
      ...valid,
      COOKIE_DOMAIN: "",
      RATE_LIMIT_ENABLED: "",
      ENABLE_API_DOCS: "",
      UPLOAD_TMP_DIR: "",
    });
    assert.equal(env.COOKIE_DOMAIN, undefined);
    assert.equal(env.RATE_LIMIT_ENABLED, true);
    assert.ok(env.UPLOAD_TMP_DIR.length > 0);
  });
  it("reports every missing required variable at once", () => {
    const list = problems({});
    for (const key of [
      "MONGO_URI",
      "ACCESS_TOKEN_SECRET",
      "REFRESH_TOKEN_SECRET",
      "CLOUDINARY_CLOUD_NAME",
    ]) {
      assert.ok(
        list.some((p) => p.startsWith(key)),
        `${key} should be reported`
      );
    }
  });
  it("rejects weak or identical JWT secrets", () => {
    assert.ok(
      problems({ ...valid, ACCESS_TOKEN_SECRET: "short" }).some((p) =>
        p.startsWith("ACCESS_TOKEN_SECRET")
      )
    );
    const same = problems({ ...valid, REFRESH_TOKEN_SECRET: valid.ACCESS_TOKEN_SECRET });
    assert.ok(same.some((p) => p.includes("must differ")));
  });
  it("rejects malformed durations, ports and booleans", () => {
    assert.ok(problems({ ...valid, ACCESS_TOKEN_EXPIRY: "soon" }).length > 0);
    assert.ok(problems({ ...valid, PORT: "70000" }).length > 0);
    assert.ok(problems({ ...valid, RATE_LIMIT_ENABLED: "yes" }).length > 0);
  });
  it("only allows SameSite=None in production (such cookies must be Secure)", () => {
    assert.ok(
      problems({ ...valid, COOKIE_SAMESITE: "none" }).some((p) => p.startsWith("COOKIE_SAMESITE"))
    );
    assert.equal(
      parseEnv({ ...valid, COOKIE_SAMESITE: "none", NODE_ENV: "production" }).COOKIE_SAMESITE,
      "none"
    );
  });
});
