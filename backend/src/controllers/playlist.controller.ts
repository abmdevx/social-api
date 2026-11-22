import type { Request, Response } from "express";
import { Types } from "mongoose";
import { ApiError } from "../lib/apiError.js";
import { sendSuccess } from "../lib/apiResponse.js";
import { visibleVideoFilter } from "../lib/visibility.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { Playlist, type IPlaylist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video, type IVideo } from "../models/video.model.js";
import { OWNER_FIELDS, type OwnerSummary } from "../types/api.js";
import {
  createPlaylistBody,
  playlistParams,
  playlistVideoParams,
  updatePlaylistBody,
  userPlaylistsParams,
} from "../validators/playlist.validators.js";

const PLAYLIST_VIDEO_FIELDS =
  "title description thumbnail videoFile views duration createdAt owner";

type PlaylistVideo = Pick<
  IVideo,
  "title" | "description" | "thumbnail" | "videoFile" | "views" | "duration" | "createdAt"
> & { _id: Types.ObjectId; owner: OwnerSummary };

type PlaylistWithVideos = Omit<IPlaylist, "videos"> & {
  _id: Types.ObjectId;
  videos: PlaylistVideo[];
};

/**
 * A playlist with its videos expanded. Videos the viewer may not see (deleted, or unpublished
 * and owned by someone else) are dropped by the populate `match`, so a playlist can never be
 * used to reach a private video.
 */
async function loadPlaylistView(
  playlistId: string,
  viewerId: Types.ObjectId
): Promise<PlaylistWithVideos> {
  const playlist = await Playlist.findById(playlistId)
    .populate<{ videos: PlaylistVideo[] }>({
      path: "videos",
      match: visibleVideoFilter(viewerId),
      select: PLAYLIST_VIDEO_FIELDS,
      populate: { path: "owner", select: OWNER_FIELDS },
    })
    .lean<PlaylistWithVideos>();
  if (!playlist) throw ApiError.notFound("Playlist not found");
  return playlist;
}

export async function createPlaylist(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { name, description, videoIds } = createPlaylistBody.parse(req.body);

  if (videoIds.length > 0) {
    const available = await Video.countDocuments({
      _id: { $in: videoIds },
      ...visibleVideoFilter(user._id),
    });
    if (available !== videoIds.length)
      throw ApiError.badRequest("Some videos were not found or are not available");
  }

  const playlist = await Playlist.create({
    owner: user._id,
    playlistName: name,
    playlistDescription: description ?? "",
    videos: videoIds.map((id) => new Types.ObjectId(id)),
  });
  sendSuccess(res, 201, { playlist }, "Playlist created successfully");
}

/** Playlists of any user. Other people's playlists only count the videos the viewer may see. */
export async function getUserPlaylists(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { userId } = userPlaylistsParams.parse(req.params);

  if (!(await User.exists({ _id: userId }))) throw ApiError.notFound("User not found");

  const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1, _id: -1 }).lean();
  if (viewer._id.equals(userId) || playlists.length === 0) {
    sendSuccess(res, 200, playlists, "User playlists fetched successfully");
    return;
  }

  const referenced = [...new Set(playlists.flatMap((playlist) => playlist.videos.map(String)))];
  const visible = await Video.find({ _id: { $in: referenced }, ...visibleVideoFilter(viewer._id) })
    .select("_id")
    .lean();
  const visibleIds = new Set(visible.map((video) => video._id.toString()));

  sendSuccess(
    res,
    200,
    playlists.map((playlist) => ({
      ...playlist,
      videos: playlist.videos.filter((id) => visibleIds.has(id.toString())),
    })),
    "User playlists fetched successfully"
  );
}

export async function getPlaylistById(req: Request, res: Response): Promise<void> {
  const viewer = getAuthUser(req);
  const { playlistId } = playlistParams.parse(req.params);
  sendSuccess(
    res,
    200,
    await loadPlaylistView(playlistId, viewer._id),
    "Playlist fetched successfully"
  );
}

export async function addVideoToPlaylist(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { playlistId, videoId } = playlistVideoParams.parse(req.params);

  if (!(await Video.exists({ _id: videoId, ...visibleVideoFilter(user._id) }))) {
    throw ApiError.notFound("Video not found");
  }
  const updated = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: user._id },
    { $addToSet: { videos: new Types.ObjectId(videoId) } },
    { new: true }
  )
    .select("_id")
    .lean();
  if (!updated) throw ApiError.notFound("Playlist not found, or you are not its owner");

  sendSuccess(res, 200, await loadPlaylistView(playlistId, user._id), "Video added to playlist");
}

export async function removeVideoFromPlaylist(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { playlistId, videoId } = playlistVideoParams.parse(req.params);

  // No video lookup: a video that has since been deleted must still be removable.
  const updated = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: user._id },
    { $pull: { videos: new Types.ObjectId(videoId) } },
    { new: true }
  )
    .select("_id")
    .lean();
  if (!updated) throw ApiError.notFound("Playlist not found, or you are not its owner");

  sendSuccess(
    res,
    200,
    await loadPlaylistView(playlistId, user._id),
    "Video removed from playlist"
  );
}

export async function updatePlaylist(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { playlistId } = playlistParams.parse(req.params);
  const { name, description } = updatePlaylistBody.parse(req.body);

  const changes: Partial<Pick<IPlaylist, "playlistName" | "playlistDescription">> = {};
  if (name !== undefined) changes.playlistName = name;
  if (description !== undefined) changes.playlistDescription = description;

  const updated = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: user._id },
    { $set: changes },
    { new: true, runValidators: true }
  )
    .select("_id")
    .lean();
  if (!updated) throw ApiError.notFound("Playlist not found, or you are not its owner");

  sendSuccess(
    res,
    200,
    await loadPlaylistView(playlistId, user._id),
    "Playlist details updated successfully"
  );
}

export async function deletePlaylist(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { playlistId } = playlistParams.parse(req.params);

  const deleted = await Playlist.findOneAndDelete({ _id: playlistId, owner: user._id }).lean();
  if (!deleted) throw ApiError.notFound("Playlist not found, or you are not its owner");

  sendSuccess(res, 200, deleted, "Playlist deleted successfully");
}
