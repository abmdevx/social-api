import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/c/:videoId", getVideoComments);
router.post("/c/:videoId/add-comment", addComment);
router.patch("/c/:commentId/v/:videoId/update-comment", updateComment);
router.delete("/c/:commentId/v/:videoId/delete-comment", deleteComment);

export default router;
