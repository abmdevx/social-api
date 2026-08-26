import { ListVideo } from "lucide-react";
import type { Playlist } from "../../types/playlist";
import { EmptyState } from "../ui/EmptyState";

export function ChannelPlaylistList({ playlists }: { playlists: Playlist[] }) {
  if (!playlists.length) return <EmptyState icon={<ListVideo size={28} />} title="No playlists yet" description="This channel has not created any playlists." />;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{playlists.map((playlist) => <article key={playlist._id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-100">{playlist.playlistName}</h2><p className="mt-1 text-sm text-slate-500">{playlist.playlistDescription || "No description"}</p></div><ListVideo className="shrink-0 text-cyan-400" size={20} /></div><p className="mt-5 text-xs text-slate-600">{playlist.videos?.length || 0} videos</p></article>)}</div>;
}
