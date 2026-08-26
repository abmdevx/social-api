import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Playlist } from "../../types/playlist";
import type { Video } from "../../types/video";
import { Button } from "../ui/Button";

export function PlaylistVideoList({ playlist, onRemove }: { playlist: Playlist; onRemove: (videoId: string) => void }) {
  return <div className="space-y-3">{playlist.videos.map((entry, index) => { const video = typeof entry === "object" ? entry as Video : null; const videoId = video?._id || entry as string; return <article key={videoId || index} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3"><Link to={video ? `/watch/${video._id}` : "#"} className="aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:w-44">{video?.thumbnail?.url && <img src={video.thumbnail.url} alt={video.title} className="size-full object-cover" />}</Link><div className="min-w-0 flex-1"><Link to={video ? `/watch/${video._id}` : "#"} className="line-clamp-2 text-sm font-semibold text-slate-100 hover:text-cyan-300">{video?.title || "Video unavailable"}</Link>{video && <p className="mt-1 text-xs text-slate-500">{new Intl.NumberFormat("en", { notation: "compact" }).format(video.views || 0)} views</p>}</div><Button size="icon" variant="ghost" onClick={() => onRemove(videoId)} aria-label="Remove video from playlist"><Trash2 size={16} /></Button></article>; })}</div>;
}
