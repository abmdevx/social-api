import { Play } from "lucide-react";
import type { Video } from "../../types/video";

export function VideoPlayer({ video }: { video: Video }) {
  return <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-2xl shadow-black/20"><video className="size-full object-contain" controls poster={video.thumbnail?.url} src={video.videoFile?.url} preload="metadata"><track kind="captions" /></video>{!video.videoFile?.url && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-600"><Play size={42} /></div>}</div>;
}
