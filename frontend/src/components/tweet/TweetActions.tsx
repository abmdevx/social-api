import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { LikeButton } from "../ui/LikeButton";

export function TweetActions({ tweetId, isOwner, onEdit, onDelete }: { tweetId: string; isOwner: boolean; onEdit: () => void; onDelete: () => void }) {
  return <div className="flex items-center gap-1"><LikeButton targetId={tweetId} target="tweet" />{isOwner && <details className="relative"><summary className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-100 [&::-webkit-details-marker]:hidden"><MoreHorizontal size={17} /></summary><div className="absolute bottom-full right-0 z-10 mb-1 min-w-32 rounded-xl border border-slate-800 bg-slate-900 p-1"><button type="button" onClick={onEdit} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800"><Pencil size={14} />Edit</button><button type="button" onClick={onDelete} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} />Delete</button></div></details>}</div>;
}
