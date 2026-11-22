import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { commentBody, commentParams } from "../../src/validators/comment.validators.js";
import { objectId, optionalText, pageQuery, text } from "../../src/validators/common.js";
import {
  createPlaylistBody,
  playlistVideoParams,
  updatePlaylistBody,
} from "../../src/validators/playlist.validators.js";
import { likedVideosQuery } from "../../src/validators/social.validators.js";
import { deleteTweetsBody, tweetBody } from "../../src/validators/tweet.validators.js";
import {
  changePasswordBody,
  loginBody,
  registerBody,
  updateAccountBody,
  usernameParams,
} from "../../src/validators/user.validators.js";
import {
  deleteVideosBody,
  listVideosQuery,
  publishBody,
  updateVideoBody,
  uploadVideoBody,
} from "../../src/validators/video.validators.js";

const ID_A = "664abc123def456789012346";
const ID_B = "664abc123def456789012347";
const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) =>
  assert.equal(schema.safeParse(value).success, true, JSON.stringify(value));
const bad = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) =>
  assert.equal(schema.safeParse(value).success, false, JSON.stringify(value));

describe("common validators", () => {
  it("objectId blocks NoSQL operator objects and short ids", () => {
    ok(objectId, ID_A);
    bad(objectId, { $ne: null });
    bad(objectId, "abcdefghijkl");
    bad(objectId, "");
  });
  it("pageQuery coerces strings, applies defaults and caps the limit", () => {
    assert.deepEqual(pageQuery.parse({}), { page: 1, limit: 10 });
    assert.deepEqual(pageQuery.parse({ page: "3", limit: "50" }), { page: 3, limit: 50 });
    bad(pageQuery, { limit: "51" });
    bad(pageQuery, { page: "0" });
    bad(pageQuery, { page: "1.5" });
  });
  it("text trims, requires content and enforces the maximum", () => {
    assert.equal(text(5).parse("  hi  "), "hi");
    bad(text(5), "   ");
    bad(text(5), "123456");
  });
  it("optionalText maps the empty string to undefined", () => {
    assert.equal(optionalText(5).parse(""), undefined);
    assert.equal(optionalText(5).parse(undefined), undefined);
    assert.equal(optionalText(5).parse(" ab "), "ab");
  });
});

describe("user validators", () => {
  const good = {
    username: "  Ab_Cd.9 ",
    email: " A@B.IO ",
    fullName: " Ada ",
    password: "12345678",
  };
  it("normalises registration input", () => {
    const parsed = registerBody.parse(good);
    assert.equal(parsed.username, "ab_cd.9");
    assert.equal(parsed.email, "a@b.io");
    assert.equal(parsed.fullName, "Ada");
  });
  it("rejects bad usernames, emails and passwords", () => {
    bad(registerBody, { ...good, username: "ab" });
    bad(registerBody, { ...good, username: "has space" });
    bad(registerBody, { ...good, username: "$ne" });
    bad(registerBody, { ...good, email: "not-an-email" });
    bad(registerBody, { ...good, password: "1234567" });
    // bcrypt silently truncates at 72 bytes, so longer passwords are refused up front.
    bad(registerBody, { ...good, password: "x".repeat(73) });
    ok(registerBody, { ...good, password: "x".repeat(72) });
  });
  it("login needs a username or an email, plus a password", () => {
    ok(loginBody, { username: "Ada", password: "x" });
    ok(loginBody, { email: "a@b.io", password: "x" });
    bad(loginBody, { password: "x" });
    bad(loginBody, { username: "ada" });
  });
  it("login rejects operator injection", () => {
    bad(loginBody, { username: { $gt: "" }, password: "x" });
    bad(loginBody, { email: "a@b.io", password: { $ne: null } });
  });
  it("change-password forbids reusing the old password", () => {
    ok(changePasswordBody, { oldPassword: "old-pass", newPassword: "new-pass-1" });
    bad(changePasswordBody, { oldPassword: "same-pass", newPassword: "same-pass" });
    bad(changePasswordBody, { oldPassword: "old", newPassword: "short" });
  });
  it("update-account needs at least one field", () => {
    bad(updateAccountBody, {});
    ok(updateAccountBody, { fullName: "Ada L" });
    ok(updateAccountBody, { email: "a@b.io" });
  });
  it("username params are normalised", () => {
    assert.equal(usernameParams.parse({ username: "ADA" }).username, "ada");
  });
});

describe("video validators", () => {
  it("list query defaults and sort whitelist", () => {
    const q = listVideosQuery.parse({});
    assert.deepEqual([q.page, q.limit, q.sortBy, q.sortType], [1, 10, "createdAt", "desc"]);
    bad(listVideosQuery, { sortBy: "password" });
    bad(listVideosQuery, { sortType: "sideways" });
    bad(listVideosQuery, { userId: "nope" });
    assert.equal(listVideosQuery.parse({ query: "   " }).query, undefined);
    bad(listVideosQuery, { query: "x".repeat(101) });
  });
  it("upload body fields are optional but bounded", () => {
    ok(uploadVideoBody, {});
    bad(uploadVideoBody, { title: "x".repeat(101) });
  });
  it("update needs title and/or description", () => {
    bad(updateVideoBody, {});
    ok(updateVideoBody, { title: "New" });
    ok(updateVideoBody, { description: "" });
    bad(updateVideoBody, { title: "  " });
  });
  it('publish flag must be a real boolean (not the string "false")', () => {
    ok(publishBody, { isPublished: false });
    bad(publishBody, { isPublished: "false" });
    bad(publishBody, {});
  });
  it("bulk delete dedupes ids and is bounded", () => {
    assert.deepEqual(deleteVideosBody.parse({ videoIds: [ID_A, ID_A, ID_B] }).videoIds, [
      ID_A,
      ID_B,
    ]);
    bad(deleteVideosBody, { videoIds: [] });
    bad(deleteVideosBody, { videoIds: Array.from({ length: 51 }, () => ID_A) });
    bad(deleteVideosBody, { videoIds: [{ $ne: null }] });
  });
});

describe("tweet, comment, playlist, social validators", () => {
  it("tweets are limited to 280 characters", () => {
    ok(tweetBody, { content: "x".repeat(280) });
    bad(tweetBody, { content: "x".repeat(281) });
    bad(tweetBody, { content: " " });
  });
  it("bulk tweet delete dedupes and is bounded", () => {
    assert.deepEqual(deleteTweetsBody.parse({ tweetIds: [ID_A, ID_A] }).tweetIds, [ID_A]);
    bad(deleteTweetsBody, { tweetIds: [] });
  });
  it("comments", () => {
    ok(commentBody, { content: "nice" });
    bad(commentBody, { content: "x".repeat(2001) });
    ok(commentParams, { commentId: ID_A, videoId: ID_B });
    bad(commentParams, { commentId: ID_A });
  });
  it("playlists", () => {
    const parsed = createPlaylistBody.parse({ name: " Mix ", videoIds: [ID_A, ID_A] });
    assert.equal(parsed.name, "Mix");
    assert.deepEqual(parsed.videoIds, [ID_A]);
    assert.deepEqual(createPlaylistBody.parse({ name: "Empty" }).videoIds, []);
    bad(createPlaylistBody, { description: "no name" });
    bad(updatePlaylistBody, {});
    ok(updatePlaylistBody, { description: "" });
    ok(playlistVideoParams, { playlistId: ID_A, videoId: ID_B });
  });
  it("limits are capped", () => {
    assert.equal(likedVideosQuery.parse({}).limit, 50);
    bad(likedVideosQuery, { limit: "101" });
  });
});
