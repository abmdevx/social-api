import { Eye, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import type { Video } from "../../types/video";

function formatDuration(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return null;
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function formatViews(views: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(views || 0);
}

function formatDate(date?: string) {
  if (!date) return "Recently";
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round((new Date(date).getTime() - Date.now()) / 86400000), "day");
}

export function VideoCard({ video }: { video: Video }) {
  const owner = typeof video.owner === "object" ? video.owner : undefined;
  const duration = formatDuration(video.duration);
  return <article className="group min-w-0">
    <Link to={`/watch/${video._id}`} className="relative block aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {video.thumbnail?.url ? <img src={video.thumbnail.url} alt={video.title} className="size-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex size-full items-center justify-center bg-slate-900 text-slate-700"><Play size={32} /></div>}
      {duration && <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/90 px-2 py-1 text-[11px] font-medium text-slate-200">{duration}</span>}
    </Link>
    <div className="mt-3 flex gap-3"><Avatar name={owner?.username || "Channel"} src={owner?.avatar?.url} size="sm" /><div className="min-w-0"><Link to={`/watch/${video._id}`} className="line-clamp-2 text-sm font-semibold leading-5 text-slate-100 transition-colors group-hover:text-cyan-300">{video.title}</Link><p className="mt-1 truncate text-xs text-slate-500">{owner?.username || "Unknown channel"}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-600"><Eye size={12} />{formatViews(video.views)} views <span>·</span> {formatDate(video.createdAt)}</p></div></div>
  </article>;
}
