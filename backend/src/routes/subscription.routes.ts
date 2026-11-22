import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.route("/c/:channelId").post(toggleSubscription).get(getUserChannelSubscribers);
router.get("/u/:subscriberId", getSubscribedChannels);

export default router;
