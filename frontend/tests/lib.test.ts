import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getErrorMessage, getErrorStatus, isNotFound } from "../src/lib/errors.ts";
import { formatBytes } from "../src/lib/files.ts";
import { formatCount, formatDuration, initials, plural, timeAgo } from "../src/lib/format.ts";

const axiosError = (status: number | undefined, message?: string) => ({
  isAxiosError: true as const,
  response: status === undefined ? undefined : { status, data: { message } },
});

describe("format", () => {
  it("formatDuration", () => {
    assert.equal(formatDuration(0), "0:00");
    assert.equal(formatDuration(75), "1:15");
    assert.equal(formatDuration(3700), "1:01:40");
    assert.equal(formatDuration(59.9), "0:59");
    assert.equal(formatDuration(undefined), "0:00");
    assert.equal(formatDuration(-5), "0:00");
    assert.equal(formatDuration(Number.NaN), "0:00");
  });
  it("formatCount", () => {
    assert.equal(formatCount(999), "999");
    assert.equal(formatCount(1234), "1.2K");
    assert.equal(formatCount(2_500_000), "2.5M");
    assert.equal(formatCount(undefined), "0");
  });
  it("timeAgo", () => {
    const now = new Date("2026-06-15T12:00:00Z");
    assert.equal(timeAgo("2026-06-15T11:59:50Z", now), "just now");
    assert.equal(timeAgo("2026-06-15T09:00:00Z", now), "3 hours ago");
    assert.equal(timeAgo("2026-06-14T12:00:00Z", now), "yesterday");
    assert.equal(timeAgo("2026-05-01T12:00:00Z", now), "last month");
    assert.equal(timeAgo(undefined, now), "");
    assert.equal(timeAgo("garbage", now), "");
  });
  it("initials", () => {
    assert.equal(initials("Ada Lovelace"), "AL");
    assert.equal(initials("  ada  "), "A");
    assert.equal(initials("Ada King Lovelace"), "AL");
    assert.equal(initials(""), "?");
    assert.equal(initials(undefined), "?");
  });
  it("plural", () => {
    assert.equal(plural(1, "video"), "1 video");
    assert.equal(plural(2, "video"), "2 videos");
    assert.equal(plural(1500, "view"), "1.5K views");
  });
  it("formatBytes", () => {
    assert.equal(formatBytes(512), "512 B");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
    assert.equal(formatBytes(100 * 1024 * 1024), "100 MB");
  });
});

describe("errors", () => {
  it("prefers the API's message", () => {
    assert.equal(getErrorMessage(axiosError(400, "Bad things")), "Bad things");
  });
  it("distinguishes server errors from unreachable servers", () => {
    assert.equal(getErrorMessage(axiosError(500), "Fallback"), "Fallback");
    assert.match(getErrorMessage(axiosError(undefined)), /Cannot reach the server/);
  });
  it("handles plain errors and unknown values", () => {
    assert.equal(getErrorMessage(new Error("boom")), "boom");
    assert.match(getErrorMessage("x"), /Something went wrong/);
  });
  it("status helpers", () => {
    assert.equal(getErrorStatus(axiosError(404)), 404);
    assert.equal(isNotFound(axiosError(404)), true);
    assert.equal(isNotFound(axiosError(500)), false);
    assert.equal(isNotFound(new Error("x")), false);
  });
});
