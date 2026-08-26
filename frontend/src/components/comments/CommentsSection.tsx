import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { addComment, deleteComment, getComments, updateComment } from "../../api/watch";
import type { Comment } from "../../types/comment";
import { useAuth } from "../../context/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { Button } from "../ui/Button";
import { ErrorState } from "../ui/ErrorState";
import { VideoGridSkeleton } from "../video/VideoGridSkeleton";
import { EmptyState } from "../ui/EmptyState";
import { CommentCard } from "./CommentCard";
import { CommentInput } from "./CommentInput";

export function CommentsSection({ videoId }: { videoId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (nextPage = 1) => { setLoading(true); setError(""); try { const result = await getComments(videoId, nextPage); setComments(nextPage === 1 ? result.comments : (current) => [...current, ...result.comments]); setPage(nextPage); setTotalPages(result.totalPages || 1); } catch (requestError) { setError(getApiErrorMessage(requestError, "Comments could not be loaded.")); } finally { setLoading(false); } }, [videoId]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const post = async (content: string) => { setPosting(true); try { const comment = await addComment(videoId, content); setComments((current) => [comment, ...current]); } catch (requestError) { setError(getApiErrorMessage(requestError, "Comment could not be posted.")); } finally { setPosting(false); } };
  const edit = async (commentId: string, content: string) => { try { const updated = await updateComment(commentId, videoId, content); setComments((current) => current.map((comment) => comment._id === commentId ? updated : comment)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Comment could not be updated.")); } };
  const remove = async (commentId: string) => { try { await deleteComment(commentId, videoId); setComments((current) => current.filter((comment) => comment._id !== commentId)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Comment could not be deleted.")); } };
  return <section className="space-y-6"><div className="flex items-center gap-2"><MessageCircle size={19} className="text-cyan-400" /><h2 className="text-lg font-semibold text-slate-100">Comments</h2></div><CommentInput onSubmit={post} loading={posting} />{loading && page === 1 ? <VideoGridSkeleton count={2} /> : error && comments.length === 0 ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : comments.length === 0 ? <EmptyState icon={<MessageCircle size={28} />} title="Start the conversation" description="Be the first to leave a thoughtful comment." /> : <div className="space-y-6">{comments.map((comment) => <CommentCard key={comment._id} comment={comment} currentUserId={user?._id} onUpdate={(content) => edit(comment._id, content)} onDelete={() => remove(comment._id)} />)}{error && <p className="text-sm text-rose-300">{error}</p>}{page < totalPages && <Button variant="ghost" onClick={() => void load(page + 1)}>Load more comments</Button>}</div>}</section>;
}
