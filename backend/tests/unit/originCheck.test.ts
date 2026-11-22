import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../../src/lib/apiError.js";
import { requireTrustedOrigin } from "../../src/middlewares/originCheck.middleware.js";

function run(method: string, origin: string | undefined, allowed = ["https://app.example.com"]) {
  const mw = requireTrustedOrigin(allowed) as unknown as (
    req: unknown,
    res: unknown,
    next: () => void
  ) => void;
  const req = { method, header: (name: string) => (name === "origin" ? origin : undefined) };
  let passed = false;
  let error: unknown;
  try {
    mw(req, {}, () => (passed = true));
  } catch (e) {
    error = e;
  }
  return { passed, error };
}

describe("requireTrustedOrigin (CSRF defence in depth)", () => {
  it("lets safe methods through from anywhere", () => {
    for (const method of ["GET", "HEAD", "OPTIONS"]) {
      assert.equal(run(method, "https://evil.example").passed, true);
    }
  });
  it("accepts state-changing requests from an allowed origin", () => {
    assert.equal(run("POST", "https://app.example.com").passed, true);
    assert.equal(run("DELETE", "https://app.example.com/").passed, true);
  });
  it("accepts requests with no Origin header (not browser-driven)", () => {
    assert.equal(run("POST", undefined).passed, true);
  });
  it("rejects state-changing requests from other origins with 403", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const { passed, error } = run(method, "https://evil.example");
      assert.equal(passed, false);
      assert.ok(error instanceof ApiError);
      assert.equal((error as ApiError).statusCode, 403);
    }
  });
  it("does not accept look-alike origins", () => {
    assert.equal(run("POST", "https://app.example.com.evil.io").passed, false);
    assert.equal(run("POST", "http://app.example.com").passed, false);
  });
});
