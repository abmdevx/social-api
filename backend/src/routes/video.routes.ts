import { Router } from "express";
import {
  deleteVideos,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
  updateVideoThumbnail,
} from "../controllers/video.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { uploadSingleImage, uploadVideoWithThumbnail } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/upload-video", ...uploadVideoWithThumbnail, publishAVideo);
router.get("/get-all-videos", getAllVideos);
router.route("/v/:videoId").get(getVideoById).patch(updateVideo);
router.patch("/v/:videoId/thumbnail", ...uploadSingleImage("thumbnail"), updateVideoThumbnail);
router.patch("/v/:videoId/publish", togglePublishStatus);
router.delete("/delete-videos", deleteVideos);

export default router;
