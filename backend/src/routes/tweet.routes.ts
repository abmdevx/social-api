import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  deleteTweets,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/create-tweet", createTweet);
router.get("/get-tweets", getUserTweets);
router.route("/t/:tweetId").patch(updateTweet).delete(deleteTweet);
router.delete("/delete-bulk-tweets", deleteTweets);

export default router;
