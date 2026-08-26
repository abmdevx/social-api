import type { Video } from "./video";

export interface Playlist {
  _id: string;
  playlistName: string;
  playlistDescription?: string;
  videos: Array<string | Video>;
}
