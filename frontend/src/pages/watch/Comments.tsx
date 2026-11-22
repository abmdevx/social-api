import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addComment,
  deleteComment,
  getComments,
  toggleCommentLike,
  updateComment,
} from "@/api/comments";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState, Spinner } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/models";

const PAGE_SIZE = 10;
const MAX_LENGTH = 2000;

function CommentItem({
  comment,
  videoId,
  onChanged,
  onDeleted,
}: {
  comment: Comment;
  videoId: string;
  onChanged: (comment: Comment) => void;
  onDeleted: (id: string) => void;
}) {
  const me = useCurrentUser();
  const mine = comment.owner._id === me._id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const like = async () => {
    try {
      const state = await toggleCommentLike(comment._id);
      onChanged({ ...comment, isLiked: state.liked, likesCount: state.likesCount });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content === comment.content) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      const updated = await updateComment(comment._id, videoId, content);
      onChanged({ ...comment, content: updated.content, updatedAt: updated.updatedAt });
      setEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await deleteComment(comment._id, videoId);
      onDeleted(comment._id);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <li className="flex gap-3">
      <Link to={`/c/${comment.owner.username}`}>
        <UserAvatar user={comment.owner} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
          <Link to={`/c/${comment.owner.username}`} className="text-sm font-medium text-foreground">
            @{comment.owner.username}
          </Link>
          <span>{timeAgo(comment.createdAt)}</span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && <span>(edited)</span>}
        </div>
        {editing ? (
          <form onSubmit={(event) => void save(event)} className="mt-1 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_LENGTH}
              autoFocus
              aria-label="Edit comment"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={busy || !draft.trim()}>
                {busy && <Loader2 className="animate-spin" />} Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-0.5 text-sm break-words whitespace-pre-wrap">{comment.content}</p>
        )}
        {!editing && (
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void like()}
              aria-pressed={!!comment.isLiked}
              aria-label="Like comment"
            >
              <Heart className={cn(comment.isLiked && "fill-current text-destructive")} />
              {formatCount(comment.likesCount ?? 0)}
            </Button>
            {mine && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit comment"
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Delete comment"
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete comment?"
        description="This cannot be undone."
        onConfirm={remove}
      />
    </li>
  );
}

export function Comments({ videoId }: { videoId: string }) {
  const me = useCurrentUser();
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const { data, error, loading, reload, setData } = useAsync(
    () => getComments(videoId, page, PAGE_SIZE),
    [videoId, page]
  );

  const patch = (updater: (comments: Comment[]) => Comment[]) =>
    setData((current) => (current ? { ...current, comments: updater(current.comments) } : current));

  const post = async (event: FormEvent) => {
    event.preventDefault();
    const content = text.trim();
    if (!content) return;
    setPosting(true);
    try {
      await addComment(videoId, content);
      setText("");
      if (page === 1) reload();
      else setPage(1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <section aria-labelledby="comments-heading" className="space-y-5">
      <h2 id="comments-heading" className="text-lg font-semibold">
        {data ? formatCount(data.totalComments) : ""} Comments
      </h2>
      <form onSubmit={(event) => void post(event)} className="flex gap-3">
        <UserAvatar user={me} />
        <div className="flex-1 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            maxLength={MAX_LENGTH}
            aria-label="Add a comment"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length}/{MAX_LENGTH}
            </span>
            <Button type="submit" size="sm" disabled={posting || !text.trim()}>
              {posting && <Loader2 className="animate-spin" />} Comment
            </Button>
          </div>
        </div>
      </form>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <Spinner />
      ) : data.comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Start the conversation."
        />
      ) : (
        <>
          <ul className="space-y-5">
            {data.comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                videoId={videoId}
                onChanged={(next) =>
                  patch((list) => list.map((c) => (c._id === next._id ? next : c)))
                }
                onDeleted={(id) => {
                  if (data.comments.length === 1 && page > 1) setPage(page - 1);
                  else reload();
                  patch((list) => list.filter((c) => c._id !== id));
                }}
              />
            ))}
          </ul>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Newer
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Older
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
