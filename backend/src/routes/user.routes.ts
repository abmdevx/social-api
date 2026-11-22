import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getUserWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { uploadRegistrationImages, uploadSingleImage } from "../middlewares/upload.middleware.js";

const router = Router();

// Public: credential endpoints get the strict limiter.
router.post("/register", authLimiter, ...uploadRegistrationImages, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh-token", authLimiter, refreshAccessToken);

// Authenticated.
router.post("/logout", requireAuth, logoutUser);
router.post("/change-password", authLimiter, requireAuth, changeCurrentPassword);
router.get("/get-current-user", requireAuth, getCurrentUser);
router.patch("/update-account", requireAuth, updateAccountDetails);
router.patch("/change-avatar", requireAuth, ...uploadSingleImage("avatar"), updateUserAvatar);
router.patch(
  "/change-cover-image",
  requireAuth,
  ...uploadSingleImage("coverImage"),
  updateUserCoverImage
);
router.get("/c/:username", requireAuth, getUserChannelProfile);
router.get("/history", requireAuth, getUserWatchHistory);

export default router;
