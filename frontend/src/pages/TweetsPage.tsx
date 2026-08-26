import { useEffect, useState } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { TweetComposer } from "../components/tweet/TweetComposer";
import { TweetList } from "../components/tweet/TweetList";
import { EditTweetModal } from "../components/tweet/EditTweetModal";
import { BulkSelectionToolbar } from "../components/tweet/BulkSelectionToolbar";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import { createTweet, deleteTweet, deleteTweets, getTweets, updateTweet } from "../api/tweets";
import type { Tweet } from "../types/tweet";
import { getApiErrorMessage } from "../utils/apiError";

export default function TweetsPage() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Tweet | null>(null);
  const [deleting, setDeleting] = useState<Tweet | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = async () => { setLoading(true); setError(""); try { setTweets(await getTweets()); } catch (requestError) { setError(getApiErrorMessage(requestError, "Tweets could not be loaded.")); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, []);
  const post = async (content: string) => { setPosting(true); setError(""); try { const tweet = await createTweet(content); setTweets((current) => [tweet, ...current]); setNotice("Tweet posted."); } catch (requestError) { setError(getApiErrorMessage(requestError, "Tweet could not be posted.")); } finally { setPosting(false); } };
  const edit = async (tweet: Tweet) => { const updated = await updateTweet(tweet._id, tweet.content); setTweets((current) => current.map((item) => item._id === updated._id ? updated : item)); setNotice("Tweet updated."); };
  const remove = async () => { if (!deleting) return; try { await deleteTweet(deleting._id); setTweets((current) => current.filter((tweet) => tweet._id !== deleting._id)); setDeleting(null); setNotice("Tweet deleted."); } catch (requestError) { setError(getApiErrorMessage(requestError, "Tweet could not be deleted.")); } };
  const removeBulk = async () => { const ids = [...selected]; try { await deleteTweets(ids); setTweets((current) => current.filter((tweet) => !ids.includes(tweet._id))); setSelected(new Set()); setBulkDeleteOpen(false); setNotice("Selected tweets deleted."); } catch (requestError) { setError(getApiErrorMessage(requestError, "Selected tweets could not be deleted.")); } };
  const select = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <AppShell><PageContainer><div className="mx-auto max-w-2xl space-y-6"><div><p className="flex items-center gap-2 text-sm font-medium text-cyan-400"><MessageSquare size={16} />Community notes</p><div className="mt-2 flex items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight text-slate-100">Tweets</h1><p className="mt-2 text-sm text-slate-500">A place for your latest thoughts.</p></div><Button variant="ghost" size="icon" onClick={() => void load()} aria-label="Refresh tweets"><RefreshCw size={17} /></Button></div></div><TweetComposer onSubmit={post} loading={posting} />{notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}{loading ? <div className="space-y-3"><Skeleton className="h-40 rounded-2xl" /><Skeleton className="h-40 rounded-2xl" /></div> : error && !tweets.length ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : tweets.length ? <><TweetList tweets={tweets} currentUserId={user?._id} selected={selected} onSelect={select} onEdit={setEditing} onDelete={setDeleting} /><BulkSelectionToolbar count={selected.size} onClear={() => setSelected(new Set())} onDelete={() => setBulkDeleteOpen(true)} /></> : <EmptyState icon={<MessageSquare size={30} />} title="No tweets yet" description="Share your first thought with the community." />}{error && tweets.length > 0 && <p role="alert" className="text-sm text-rose-300">{error}</p>}</div><EditTweetModal key={editing?._id || "closed"} tweet={editing} onClose={() => setEditing(null)} onUpdated={edit} /><ConfirmDialog open={Boolean(deleting)} title="Delete this tweet?" description="This action permanently removes the tweet." confirmLabel="Delete tweet" onClose={() => setDeleting(null)} onConfirm={() => void remove()} /><ConfirmDialog open={bulkDeleteOpen} title="Delete selected tweets?" description="This action permanently removes every selected tweet." confirmLabel="Delete tweets" onClose={() => setBulkDeleteOpen(false)} onConfirm={() => void removeBulk()} /></PageContainer></AppShell>;
}
