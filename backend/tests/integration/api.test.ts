/**
 * End-to-end API tests against a real (disposable!) MongoDB.
 *
 *   TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm run test:integration
 *
 * A throw-away database named streamline_test_<timestamp> is created and dropped again.
 * Cloudinary is never contacted: media rows are seeded straight into the database.
 */
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";

const mongoUri = process.env.TEST_MONGO_URI;
const suiteOptions = {
  skip: mongoUri ? false : "set TEST_MONGO_URI to a disposable MongoDB to run",
};

interface Reply {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- response bodies are asserted field by field
  json: any;
  headers: Headers;
}

describe("API integration", suiteOptions, () => {
  let server: Server;
  let baseUrl = "";
  let models: {
    Video: (typeof import("../../src/models/video.model.js"))["Video"];
    Tweet: (typeof import("../../src/models/tweet.model.js"))["Tweet"];
    Playlist: (typeof import("../../src/models/playlist.model.js"))["Playlist"];
  };

  const password = "correct-horse-battery";
  const media = { url: "https://example.test/x.jpg", publicId: "x" };
  const ids = {} as Record<"alice" | "bob" | "carol", string>;
  const token = {} as Record<"alice" | "bob" | "carol", string>;

  async function call(
    method: string,
    path: string,
    options: { as?: keyof typeof token; body?: unknown; headers?: Record<string, string> } = {}
  ): Promise<Reply> {
    const headers: Record<string, string> = { ...options.headers };
    if (options.body !== undefined) headers["content-type"] = "application/json";
    if (options.as) headers.authorization = `Bearer ${token[options.as]}`;
    const response = await fetch(`${baseUrl}/api/v1${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const json: unknown = await response.json().catch(() => null);
    return { status: response.status, json, headers: response.headers };
  }

  before(async () => {
    Object.assign(process.env, {
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      MONGO_URI: mongoUri,
      DB_NAME: `streamline_test_${Date.now()}`,
      CORS_ORIGIN: "http://localhost:5173",
      ACCESS_TOKEN_SECRET: "a".repeat(48),
      REFRESH_TOKEN_SECRET: "b".repeat(48),
      CLOUDINARY_CLOUD_NAME: "test",
      CLOUDINARY_API_KEY: "test",
      CLOUDINARY_API_SECRET: "test",
      RATE_LIMIT_ENABLED: "false",
    });

    const { connectDatabase } = await import("../../src/db/connection.js");
    const { createApp } = await import("../../src/app.js");
    const { tokens } = await import("../../src/services/token.service.js");
    const { User } = await import("../../src/models/user.model.js");
    await connectDatabase();

    for (const name of ["alice", "bob", "carol"] as const) {
      const user = await User.create({
        username: name,
        email: `${name}@example.test`,
        fullName: name.toUpperCase(),
        password,
        avatar: media,
      });
      ids[name] = user._id.toString();
      token[name] = tokens.signAccessToken(ids[name]);
    }

    server = createApp().listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    models = {
      Video: (await import("../../src/models/video.model.js")).Video,
      Tweet: (await import("../../src/models/tweet.model.js")).Tweet,
      Playlist: (await import("../../src/models/playlist.model.js")).Playlist,
    };
  });

  after(async () => {
    const mongoose = (await import("mongoose")).default;
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  describe("public surface", () => {
    it("healthcheck reports ok", async () => {
      const r = await call("GET", "/healthcheck");
      assert.equal(r.status, 200);
      assert.equal(r.json.data.status, "ok");
    });
    it("protected routes answer 401 in the standard envelope", async () => {
      const r = await call("GET", "/videos/get-all-videos");
      assert.equal(r.status, 401);
      assert.equal(r.json.success, false);
      assert.equal(r.json.data, null);
      assert.ok(r.headers.get("x-request-id"));
    });
    it("unknown routes are a JSON 404", async () => {
      const r = await call("GET", "/does-not-exist");
      assert.equal(r.status, 404);
      assert.equal(r.json.success, false);
    });
    it("sets security headers", async () => {
      const r = await call("GET", "/healthcheck");
      assert.equal(r.headers.get("x-content-type-options"), "nosniff");
      assert.equal(r.headers.get("x-powered-by"), null);
    });
    it("rejects malformed ids with a 400 and field details", async () => {
      const r = await call("GET", "/videos/v/not-an-id", { as: "alice" });
      assert.equal(r.status, 400);
      assert.ok(Array.isArray(r.json.errors) && r.json.errors.length > 0);
    });
    it("rejects cross-origin state changes (CSRF defence in depth)", async () => {
      const r = await call("POST", "/users/login", {
        headers: { origin: "https://evil.example" },
        body: { username: "alice", password },
      });
      assert.equal(r.status, 403);
    });
  });

  describe("authentication", () => {
    it("login failure is identical for a wrong password and an unknown user", async () => {
      const wrong = await call("POST", "/users/login", {
        body: { username: "alice", password: "nope-nope-nope" },
      });
      const unknown = await call("POST", "/users/login", {
        body: { username: "nobody", password },
      });
      assert.equal(wrong.status, 401);
      assert.equal(unknown.status, 401);
      assert.equal(wrong.json.message, unknown.json.message);
    });
    it("login sets httpOnly cookies and never returns secrets", async () => {
      const r = await call("POST", "/users/login", {
        body: { email: "alice@example.test", password },
      });
      assert.equal(r.status, 200);
      const cookies = r.headers.getSetCookie();
      const access = cookies.find((c) => c.startsWith("accessToken="));
      const refresh = cookies.find((c) => c.startsWith("refreshToken="));
      assert.ok(access && /HttpOnly/i.test(access));
      assert.ok(refresh && /HttpOnly/i.test(refresh) && /Path=\/api\/v1\/users/i.test(refresh));
      const serialised = JSON.stringify(r.json);
      assert.doesNotMatch(serialised, /"password"|refreshTokenHash|\$2[aby]\$/);
    });
    it("rotates refresh tokens and treats reuse as theft", async () => {
      const login = await call("POST", "/users/login", { body: { username: "bob", password } });
      const first: string = login.json.data.refreshToken;

      const rotated = await call("POST", "/users/refresh-token", { body: { refreshToken: first } });
      assert.equal(rotated.status, 200);
      const second: string = rotated.json.data.refreshToken;
      assert.notEqual(first, second);

      const replay = await call("POST", "/users/refresh-token", { body: { refreshToken: first } });
      assert.equal(replay.status, 401);

      // The replay revoked the whole session, so even the legitimate newest token is dead.
      const afterReplay = await call("POST", "/users/refresh-token", {
        body: { refreshToken: second },
      });
      assert.equal(afterReplay.status, 401);
    });
    it("rejects garbage and tokens of the wrong kind", async () => {
      assert.equal(
        (
          await call("GET", "/users/get-current-user", {
            headers: { authorization: "Bearer junk" },
          })
        ).status,
        401
      );
      const login = await call("POST", "/users/login", { body: { username: "carol", password } });
      const refreshAsAccess = await call("GET", "/users/get-current-user", {
        headers: { authorization: `Bearer ${login.json.data.refreshToken as string}` },
      });
      assert.equal(refreshAsAccess.status, 401);
    });
    it("returns the current user without secrets", async () => {
      const r = await call("GET", "/users/get-current-user", { as: "alice" });
      assert.equal(r.status, 200);
      assert.equal(r.json.data.username, "alice");
      assert.equal(r.json.data.password, undefined);
    });
  });

  describe("authorization between users", () => {
    const state = {} as Record<
      "privateVideo" | "publicVideo" | "tweet" | "alicePlaylist" | "bobPlaylist",
      string
    >;

    before(async () => {
      const privateVideo = await models.Video.create({
        owner: ids.alice,
        videoFile: media,
        title: "Alice private",
        isPublished: false,
      });
      const publicVideo = await models.Video.create({
        owner: ids.alice,
        videoFile: media,
        title: "Alice public",
        isPublished: true,
      });
      const tweet = await models.Tweet.create({ owner: ids.alice, content: "hello" });
      const alicePlaylist = await models.Playlist.create({
        owner: ids.alice,
        playlistName: "A",
        videos: [],
      });
      const bobPlaylist = await models.Playlist.create({
        owner: ids.bob,
        playlistName: "B",
        videos: [],
      });
      state.privateVideo = privateVideo._id.toString();
      state.publicVideo = publicVideo._id.toString();
      state.tweet = tweet._id.toString();
      state.alicePlaylist = alicePlaylist._id.toString();
      state.bobPlaylist = bobPlaylist._id.toString();
    });

    it("hides unpublished videos from everyone but the owner", async () => {
      assert.equal(
        (await call("GET", `/videos/v/${state.privateVideo}`, { as: "bob" })).status,
        404
      );
      assert.equal(
        (await call("GET", `/videos/v/${state.privateVideo}`, { as: "alice" })).status,
        200
      );
      const feed = await call("GET", "/videos/get-all-videos", { as: "bob" });
      const titles = (feed.json.data.docs as Array<{ title: string }>).map((v) => v.title);
      assert.ok(titles.includes("Alice public"));
      assert.ok(!titles.includes("Alice private"));
    });
    it("forbids editing, publishing and deleting other people's videos", async () => {
      assert.equal(
        (
          await call("PATCH", `/videos/v/${state.publicVideo}`, {
            as: "bob",
            body: { title: "pwned" },
          })
        ).status,
        404
      );
      assert.equal(
        (
          await call("PATCH", `/videos/v/${state.publicVideo}/publish`, {
            as: "bob",
            body: { isPublished: false },
          })
        ).status,
        404
      );
      const del = await call("DELETE", "/videos/delete-videos", {
        as: "bob",
        body: { videoIds: [state.publicVideo] },
      });
      assert.equal(del.status, 404);
      assert.ok(await models.Video.exists({ _id: state.publicVideo }));
    });
    it("forbids editing and deleting other people's tweets", async () => {
      assert.equal(
        (await call("PATCH", `/tweets/t/${state.tweet}`, { as: "bob", body: { content: "pwned" } }))
          .status,
        404
      );
      assert.equal((await call("DELETE", `/tweets/t/${state.tweet}`, { as: "bob" })).status, 404);
      const bulk = await call("DELETE", "/tweets/delete-bulk-tweets", {
        as: "bob",
        body: { tweetIds: [state.tweet] },
      });
      assert.equal(bulk.status, 404);
      assert.ok(await models.Tweet.exists({ _id: state.tweet }));
    });
    it("keeps subscription lists private", async () => {
      assert.equal((await call("GET", `/subscriptions/u/${ids.alice}`, { as: "bob" })).status, 403);
      assert.equal(
        (await call("GET", `/subscriptions/u/${ids.alice}`, { as: "alice" })).status,
        200
      );
    });
    it("only shows an email address to its owner", async () => {
      const other = await call("GET", "/users/c/alice", { as: "bob" });
      assert.equal(other.json.data.email, undefined);
      const self = await call("GET", "/users/c/alice", { as: "alice" });
      assert.equal(self.json.data.email, "alice@example.test");
    });
    it("cannot like what it cannot see", async () => {
      assert.equal(
        (await call("POST", `/likes/l/${state.privateVideo}`, { as: "bob" })).status,
        404
      );
    });
    it("lets only a playlist's owner change it, and only with visible videos", async () => {
      assert.equal(
        (
          await call("PUT", `/playlists/p/${state.alicePlaylist}/v/${state.publicVideo}`, {
            as: "bob",
          })
        ).status,
        404
      );
      assert.equal(
        (
          await call("PATCH", `/playlists/p/${state.alicePlaylist}`, {
            as: "bob",
            body: { name: "x" },
          })
        ).status,
        404
      );
      assert.equal(
        (await call("DELETE", `/playlists/p/${state.alicePlaylist}`, { as: "bob" })).status,
        404
      );
      assert.equal(
        (
          await call("PUT", `/playlists/p/${state.bobPlaylist}/v/${state.privateVideo}`, {
            as: "bob",
          })
        ).status,
        404
      );
      assert.equal(
        (
          await call("POST", "/playlists/create-playlist", {
            as: "bob",
            body: { name: "n", videoIds: [state.privateVideo] },
          })
        ).status,
        400
      );
    });
    it("drops videos from a playlist once they stop being visible", async () => {
      const added = await call("PUT", `/playlists/p/${state.bobPlaylist}/v/${state.publicVideo}`, {
        as: "bob",
      });
      assert.equal(added.status, 200);
      assert.equal(added.json.data.videos.length, 1);

      await call("PATCH", `/videos/v/${state.publicVideo}/publish`, {
        as: "alice",
        body: { isPublished: false },
      });
      const hidden = await call("GET", `/playlists/p/${state.bobPlaylist}`, { as: "bob" });
      assert.equal(hidden.json.data.videos.length, 0);
      await call("PATCH", `/videos/v/${state.publicVideo}/publish`, {
        as: "alice",
        body: { isPublished: true },
      });
    });
    it("toggles likes idempotently with accurate counts", async () => {
      const on = await call("POST", `/likes/l/${state.publicVideo}`, { as: "bob" });
      assert.deepEqual([on.json.data.liked, on.json.data.likesCount], [true, 1]);
      const off = await call("POST", `/likes/l/${state.publicVideo}`, { as: "bob" });
      assert.deepEqual([off.json.data.liked, off.json.data.likesCount], [false, 0]);
    });
    it("lets a comment's author or the video's owner delete it, nobody else", async () => {
      const created = await call("POST", `/comments/c/${state.publicVideo}/add-comment`, {
        as: "bob",
        body: { content: "nice" },
      });
      assert.equal(created.status, 201);
      const commentId: string = created.json.data._id;
      const path = `/comments/c/${commentId}/v/${state.publicVideo}/delete-comment`;
      assert.equal((await call("DELETE", path, { as: "carol" })).status, 403);
      assert.equal((await call("DELETE", path, { as: "alice" })).status, 200);
    });
    it("bulk tweet delete only touches the caller's own tweets", async () => {
      const mine = await call("POST", "/tweets/create-tweet", {
        as: "bob",
        body: { content: "mine" },
      });
      const bulk = await call("DELETE", "/tweets/delete-bulk-tweets", {
        as: "bob",
        body: { tweetIds: [mine.json.data._id, state.tweet] },
      });
      assert.equal(bulk.status, 200);
      assert.equal(bulk.json.data.deletedCount, 1);
      assert.ok(await models.Tweet.exists({ _id: state.tweet }));
    });
  });
});
