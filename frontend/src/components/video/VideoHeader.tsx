import { Eye } from "lucide-react";
import type { Video } from "../../types/video";

export function VideoHeader({ video }: { video: Video }) {
  const date = video.createdAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(video.createdAt)) : "Date unavailable";
  return <div><h1 className="text-xl font-semibold leading-7 text-slate-100 sm:text-2xl">{video.title}</h1><div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500"><span className="inline-flex items-center gap-1"><Eye size={15} />{new Intl.NumberFormat("en", { notation: "compact" }).format(video.views || 0)} views</span><span>·</span><span>{date}</span></div></div>;
}
