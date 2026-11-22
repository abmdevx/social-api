import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { durationToSeconds } from "../../src/lib/duration.js";
import { escapeRegex } from "../../src/lib/escapeRegex.js";
import { detectMediaKind } from "../../src/lib/fileSignature.js";
import { isObjectIdString } from "../../src/lib/objectId.js";
import { buildPage, skipFor } from "../../src/lib/pagination.js";

const pad = (bytes: number[]): Uint8Array => {
  const out = new Uint8Array(16);
  out.set(bytes);
  return out;
};
const ascii = (text: string, offset = 0): number[] => [
  ...new Array<number>(offset).fill(0),
  ...[...text].map((c) => c.charCodeAt(0)),
];

describe("isObjectIdString", () => {
  it("accepts 24 hex characters in any case", () => {
    assert.equal(isObjectIdString("664abc123def456789012346"), true);
    assert.equal(isObjectIdString("664ABC123DEF456789012346"), true);
  });
  it("rejects 12-character strings that mongoose would silently cast", () => {
    assert.equal(isObjectIdString("abcdefghijkl"), false);
  });
  it("rejects wrong lengths, non-hex and non-strings", () => {
    assert.equal(isObjectIdString("664abc"), false);
    assert.equal(isObjectIdString("zzzabc123def456789012346"), false);
    assert.equal(isObjectIdString({ $ne: null }), false);
    assert.equal(isObjectIdString(undefined), false);
  });
});

describe("escapeRegex", () => {
  it("escapes every regex metacharacter", () => {
    const input = ".*+?^${}()|[]\\";
    const re = new RegExp(`^${escapeRegex(input)}$`);
    assert.equal(re.test(input), true);
  });
  it("neutralises catastrophic-backtracking input", () => {
    const re = new RegExp(escapeRegex("(a+)+$"), "i");
    assert.equal(re.test("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!"), false);
    assert.equal(re.test("xx(a+)+$xx"), true);
  });
});

describe("durationToSeconds", () => {
  it("converts every unit", () => {
    assert.equal(durationToSeconds("30s"), 30);
    assert.equal(durationToSeconds("15m"), 900);
    assert.equal(durationToSeconds("2h"), 7200);
    assert.equal(durationToSeconds("7d"), 604800);
  });
  it("rejects malformed input", () => {
    for (const bad of ["", "15", "m", "1w", "-5m", "1.5h", "15 minutes"]) {
      assert.throws(() => durationToSeconds(bad), /Invalid duration/, bad);
    }
  });
});

describe("pagination", () => {
  it("builds the envelope for a middle page", () => {
    const page = buildPage(["a", "b"], 25, 2, 10);
    assert.equal(page.totalPages, 3);
    assert.equal(page.hasNextPage, true);
    assert.equal(page.hasPrevPage, true);
    assert.equal(page.nextPage, 3);
    assert.equal(page.prevPage, 1);
  });
  it("reports one empty page when there are no documents", () => {
    const page = buildPage([], 0, 1, 10);
    assert.equal(page.totalPages, 1);
    assert.equal(page.hasNextPage, false);
    assert.equal(page.nextPage, null);
    assert.equal(page.prevPage, null);
  });
  it("computes skip", () => {
    assert.equal(skipFor(1, 10), 0);
    assert.equal(skipFor(3, 12), 24);
  });
});

describe("detectMediaKind (magic bytes)", () => {
  it("recognises images", () => {
    assert.equal(detectMediaKind(pad([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 5, 6, 7, 8])), "image");
    assert.equal(
      detectMediaKind(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])),
      "image"
    );
    assert.equal(detectMediaKind(pad([...ascii("GIF89a"), 0, 0, 0, 0, 0, 0])), "image");
    assert.equal(detectMediaKind(pad([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")])), "image");
    assert.equal(detectMediaKind(pad([0, 0, 0, 0x1c, ...ascii("ftypavif")])), "image");
  });
  it("recognises videos", () => {
    assert.equal(detectMediaKind(pad([0, 0, 0, 0x20, ...ascii("ftypisom")])), "video");
    assert.equal(detectMediaKind(pad([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3, 4, 5, 6, 7, 8])), "video");
  });
  it("refuses executables, scripts and truncated files even if they claim to be media", () => {
    assert.equal(detectMediaKind(pad([...ascii("MZ"), 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0])), null);
    assert.equal(detectMediaKind(pad(ascii("<?php echo 1;"))), null);
    assert.equal(detectMediaKind(pad(ascii("<svg xmlns='x'>"))), null);
    assert.equal(detectMediaKind(new Uint8Array([0xff, 0xd8, 0xff])), null);
  });
});
