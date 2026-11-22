import { Schema, model, type Types } from "mongoose";

export interface IPlaylist {
  playlistName: string;
  playlistDescription?: string;
  videos: Types.ObjectId[];
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylist>(
  {
    playlistName: { type: String, required: true, trim: true, maxlength: 100 },
    playlistDescription: { type: String, trim: true, maxlength: 500 },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

playlistSchema.index({ owner: 1, createdAt: -1 });

export const Playlist = model<IPlaylist>("Playlist", playlistSchema);
