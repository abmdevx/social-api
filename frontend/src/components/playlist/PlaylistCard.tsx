import { ListVideo } from "lucide-react";
import { Link } from "react-router-dom";
import type { Playlist } from "../../types/playlist";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return <Link to={`/playlists/${playlist._id}`} className="group block rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-cyan-400/40 hover:bg-slate-900"><div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><ListVideo size={21} /></span><span className="text-xs text-slate-500">{playlist.videos?.length || 0} videos</span></div><h2 className="mt-6 truncate font-semibold text-slate-100 group-hover:text-cyan-300">{playlist.playlistName}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{playlist.playlistDescription || "No description"}</p></Link>;
}
