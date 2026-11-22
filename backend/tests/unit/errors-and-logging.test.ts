import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { ApiError } from "../../src/lib/apiError.js";
import { buildResponse } from "../../src/lib/apiResponse.js";
import { normalizeError } from "../../src/lib/errorResponse.js";
import { configureLogger, logger, redact } from "../../src/lib/logger.js";
import { toPublicUser, type PublicUser } from "../../src/lib/serializers.js";
import { errorHandler, notFoundHandler } from "../../src/middlewares/error.middleware.js";

const named = (name: string, extra: Record<string, unknown> = {}): Error =>
  Object.assign(new Error("boom"), { name }, extra);

describe("normalizeError", () => {
  it("passes ApiError through unchanged", () => {
    const n = normalizeError(ApiError.forbidden("nope"));
    assert.deepEqual([n.statusCode, n.message, n.isServerFault], [403, "nope", false]);
  });
  it("turns zod failures into a 400 with field details", () => {
    const parsed = z.object({ age: z.number() }).safeParse({ age: "x" });
    assert.equal(parsed.success, false);
    if (parsed.success) return;
    const n = normalizeError(parsed.error);
    assert.equal(n.statusCode, 400);
    assert.equal(n.errors[0]?.path, "age");
    assert.match(n.message, /^age: /);
  });
  it("maps body-parser errors", () => {
    assert.equal(normalizeError({ type: "entity.too.large" }).statusCode, 413);
    assert.equal(normalizeError({ type: "entity.parse.failed" }).statusCode, 400);
  });
  it("maps multer errors without leaking internals", () => {
    assert.equal(normalizeError(named("MulterError", { code: "LIMIT_FILE_SIZE" })).statusCode, 413);
    assert.equal(
      normalizeError(named("MulterError", { code: "LIMIT_UNEXPECTED_FILE", field: "x" }))
        .statusCode,
      400
    );
    assert.equal(
      normalizeError(named("MulterError", { code: "OTHER" })).message,
      "Invalid file upload"
    );
  });
  it("maps JWT errors to a generic 401", () => {
    for (const name of ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"]) {
      const n = normalizeError(named(name));
      assert.deepEqual([n.statusCode, n.message], [401, "Invalid or expired token"]);
    }
  });
  it("maps mongoose cast, validation and duplicate-key errors", () => {
    assert.equal(
      normalizeError(named("CastError", { path: "_id" })).message,
      "Invalid value for _id"
    );
    const v = normalizeError(
      named("ValidationError", { errors: { title: { message: "too long" } } })
    );
    assert.deepEqual([v.statusCode, v.message], [400, "too long"]);
    const dup = normalizeError({ code: 11000, keyPattern: { email: 1 } });
    assert.deepEqual([dup.statusCode, dup.message], [409, "email is already in use"]);
  });
  it("trusts 4xx statuses from http-errors but never 5xx", () => {
    assert.equal(normalizeError({ status: 404, message: "gone" }).statusCode, 404);
    const hidden = normalizeError({ status: 503, message: "db password is hunter2" });
    assert.equal(hidden.statusCode, 500);
    assert.equal(hidden.message, "Internal server error");
  });
  it("hides everything about unknown errors and flags them as server faults", () => {
    for (const value of [new Error("secret stack detail"), "string", null, undefined, 42]) {
      const n = normalizeError(value);
      assert.deepEqual(
        [n.statusCode, n.message, n.isServerFault],
        [500, "Internal server error", true]
      );
    }
  });
});

describe("envelopes", () => {
  it("marks success by status code", () => {
    assert.equal(buildResponse(201, {}, "ok").success, true);
    assert.equal(buildResponse(400, null, "bad").success, false);
  });
});

describe("errorHandler / notFoundHandler", () => {
  function fakeRes(headersSent = false) {
    const res = {
      headersSent,
      locals: { requestId: "req-1" } as Record<string, unknown>,
      statusCode: 0,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        this.body = body;
        return this;
      },
    };
    return res;
  }
  const req = { method: "GET", path: "/x" };

  it("writes the standard JSON envelope with the request id", () => {
    configureLogger({ level: "silent", pretty: false });
    const res = fakeRes();
    (errorHandler as unknown as (...a: unknown[]) => void)(
      ApiError.notFound("missing"),
      req,
      res,
      () => {}
    );
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
      statusCode: 404,
      data: null,
      message: "missing",
      success: false,
      errors: [],
      requestId: "req-1",
    });
  });
  it("delegates to Express when headers were already sent", () => {
    const res = fakeRes(true);
    let delegated: unknown;
    (errorHandler as unknown as (...a: unknown[]) => void)(
      new Error("late"),
      req,
      res,
      (e: unknown) => (delegated = e)
    );
    assert.ok(delegated instanceof Error);
    assert.equal(res.body, undefined);
  });
  it("creates a 404 for unknown routes", () => {
    let passed: unknown;
    (notFoundHandler as unknown as (...a: unknown[]) => void)(
      { method: "POST", path: "/nope" },
      {},
      (e: unknown) => (passed = e)
    );
    assert.ok(passed instanceof ApiError);
    assert.equal((passed as ApiError).statusCode, 404);
  });
});

describe("logger redaction", () => {
  it("masks sensitive keys at any depth, case-insensitively", () => {
    const out = redact({
      user: "a",
      password: "p",
      nested: { Authorization: "Bearer x", refreshToken: "r", ok: 1 },
      list: [{ api_key: "k" }],
      cookie: "c",
    }) as Record<string, unknown>;
    assert.equal(out.password, "[REDACTED]");
    assert.equal(out.cookie, "[REDACTED]");
    assert.equal(out.user, "a");
    assert.deepEqual(out.nested, {
      Authorization: "[REDACTED]",
      refreshToken: "[REDACTED]",
      ok: 1,
    });
    assert.deepEqual(out.list, [{ api_key: "[REDACTED]" }]);
  });
  it("serialises errors and survives circular structures", () => {
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;
    assert.doesNotThrow(() => redact(circular));
    const err = redact(new Error("x")) as { message: string; name: string };
    assert.deepEqual([err.name, err.message], ["Error", "x"]);
  });
  it("respects the configured level", () => {
    configureLogger({ level: "error", pretty: false });
    const lines: string[] = [];
    const original = console.log;
    console.log = (line: string) => lines.push(line);
    try {
      logger.info("hidden");
    } finally {
      console.log = original;
      configureLogger({ level: "silent", pretty: false });
    }
    assert.equal(lines.length, 0);
  });
});

describe("toPublicUser", () => {
  it("is an allow-list: secrets and unknown fields never leak", () => {
    const polluted = {
      _id: "id",
      username: "u",
      email: "e@x.io",
      fullName: "U",
      avatar: { url: "a", publicId: "p" },
      createdAt: new Date(0),
      updatedAt: new Date(0),
      password: "$2b$hash",
      refreshTokenHash: "abc",
      watchHistory: ["1"],
    } as unknown as PublicUser;
    const json = JSON.stringify(toPublicUser(polluted));
    assert.doesNotMatch(json, /password|refreshTokenHash|watchHistory|\$2b/);
    assert.match(json, /"username":"u"/);
  });
});
