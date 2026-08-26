import { MessageSquare } from "lucide-react";
import type { Tweet } from "../../types/tweet";
import { EmptyState } from "../ui/EmptyState";

export function ChannelTweetList({ tweets, unavailable = false }: { tweets: Tweet[]; unavailable?: boolean }) {
  if (unavailable) return <EmptyState icon={<MessageSquare size={28} />} title="Tweets are not available here" description="The current backend only exposes tweets for the authenticated user." />;
  if (!tweets.length) return <EmptyState icon={<MessageSquare size={28} />} title="No tweets yet" description="This channel has not shared any tweets." />;
  return <div className="space-y-3">{tweets.map((tweet) => <article key={tweet._id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{tweet.content}</p>{tweet.createdAt && <time className="mt-3 block text-xs text-slate-600">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(tweet.createdAt))}</time>}</article>)}</div>;
}
