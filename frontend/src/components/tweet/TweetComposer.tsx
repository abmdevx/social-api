import { Send } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useAuth } from "../../context/useAuth";

export function TweetComposer({ onSubmit, loading }: { onSubmit: (content: string) => Promise<void>; loading: boolean }) {
  const { user } = useAuth(); const [content, setContent] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!content.trim()) return; await onSubmit(content.trim()); setContent(""); };
  return <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5"><div className="flex gap-3"><Avatar name={user?.fullName || "User"} src={user?.avatar?.url} /><Textarea id="tweet-composer" aria-label="Tweet content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a thought with your community..." maxLength={280} rows={3} className="border-0 bg-transparent px-0 py-0 focus:border-transparent" /></div><div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3"><span className="text-xs text-slate-600">{content.length}/280</span><Button type="submit" size="sm" variant="primary" disabled={loading || !content.trim()}>{loading ? "Posting..." : "Post"}<Send size={14} /></Button></div></form>;
}
