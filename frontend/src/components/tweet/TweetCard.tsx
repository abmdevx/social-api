import { Avatar } from "../ui/Avatar";
import type { Tweet } from "../../types/tweet";
import { TweetActions } from "./TweetActions";

export function TweetCard({ tweet, currentUserId, selected, onSelect, onEdit, onDelete }: { tweet: Tweet; currentUserId?: string; selected: boolean; onSelect: () => void; onEdit: () => void; onDelete: () => void }) {
  const isOwner = Boolean(currentUserId && tweet.owner === currentUserId);
  const date = tweet.createdAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(tweet.createdAt)) : "Recently";
  return <article className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5"><div className="flex gap-3"><input type="checkbox" checked={selected} onChange={onSelect} aria-label="Select tweet" className="mt-1 size-4 accent-cyan-400" /><Avatar name="You" size="sm" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-100">{isOwner ? "You" : "User"}</span><span className="text-xs text-slate-600">@{isOwner ? "you" : "member"} · {date}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{tweet.content}</p><div className="mt-4"><TweetActions tweetId={tweet._id} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} /></div></div></div></article>;
}
