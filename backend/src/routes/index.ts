import { Router } from "express";
import commentRouter from "./comment.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import likeRouter from "./like.routes.js";
import playlistRouter from "./playlist.routes.js";
import subscriptionRouter from "./subscription.routes.js";
import tweetRouter from "./tweet.routes.js";
import userRouter from "./user.routes.js";
import videoRouter from "./video.routes.js";

/** Every authenticated and public resource router, mounted under the API prefix by the app. */
export function createApiRouter(): Router {
  const router = Router();
  router.use("/users", userRouter);
  router.use("/tweets", tweetRouter);
  router.use("/videos", videoRouter);
  router.use("/comments", commentRouter);
  router.use("/subscriptions", subscriptionRouter);
  router.use("/likes", likeRouter);
  router.use("/playlists", playlistRouter);
  router.use("/dashboard", dashboardRouter);
  return router;
}
