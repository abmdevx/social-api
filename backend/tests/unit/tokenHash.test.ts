import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractBearerToken, hashToken, safeEqual } from "../../src/lib/tokenHash.js";

describe("hashToken", () => {
  it("is deterministic, hex SHA-256 and does not contain the token", () => {
    const hash = hashToken("secret-token");
    assert.equal(hash, hashToken("secret-token"));
    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.notEqual(hash, hashToken("secret-token2"));
    assert.ok(!hash.includes("secret"));
  });
});

describe("safeEqual", () => {
  it("compares in a length-safe way", () => {
    assert.equal(safeEqual("abc", "abc"), true);
    assert.equal(safeEqual("abc", "abd"), false);
    assert.equal(safeEqual("abc", "abcd"), false);
    assert.equal(safeEqual("", ""), true);
  });
});

describe("extractBearerToken", () => {
  it("reads a well-formed header", () => {
    assert.equal(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
    assert.equal(extractBearerToken("bearer abc"), "abc");
    assert.equal(extractBearerToken("  Bearer   abc  "), "abc");
  });
  it("ignores everything else", () => {
    for (const bad of [undefined, "", "Bearer", "Bearer a b", "Basic abc", "abc"]) {
      assert.equal(extractBearerToken(bad), undefined, String(bad));
    }
  });
});
