import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/l/:videoId", toggleVideoLike);
router.post("/c/:commentId", toggleCommentLike);
router.post("/t/:tweetId", toggleTweetLike);
router.get("/get-liked-videos", getLikedVideos);

export default router;
