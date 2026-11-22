import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/create-playlist", createPlaylist);
router.route("/p/:playlistId").get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist);
router.get("/users/:userId/playlists", getUserPlaylists);
router.route("/p/:playlistId/v/:videoId").put(addVideoToPlaylist).delete(removeVideoFromPlaylist);

export default router;
