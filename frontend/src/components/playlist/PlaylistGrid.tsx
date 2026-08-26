import type { Playlist } from "../../types/playlist";
import { PlaylistCard } from "./PlaylistCard";

export function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{playlists.map((playlist) => <PlaylistCard key={playlist._id} playlist={playlist} />)}</div>;
}
