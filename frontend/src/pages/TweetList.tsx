import { useState, type FormEvent } from "react";
import { Heart, Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTweet, deleteTweets, toggleTweetLike, updateTweet } from "@/api/tweets";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, plural, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tweet } from "@/types/models";

const MAX = 280; // keep in sync with backend TWEET_MAX_LENGTH

function TweetItem({
  tweet,
  selecting,
  selected,
  onSelect,
  onChange,
  onRemove,
}: {
  tweet: Tweet;
  selecting: boolean;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onChange: (tweet: Tweet) => void;
  onRemove: (id: string) => void;
}) {
  const me = useCurrentUser();
  const mine = tweet.owner._id === me._id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tweet.content);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const like = async () => {
    try {
      const state = await toggleTweetLike(tweet._id);
      onChange({ ...tweet, isLiked: state.liked, likesCount: state.likesCount });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content === tweet.content) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      const updated = await updateTweet(tweet._id, content);
      onChange({ ...tweet, content: updated.content, updatedAt: updated.updatedAt });
      setEditing(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await deleteTweet(tweet._id);
      onRemove(tweet._id);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <li className="flex gap-3 rounded-xl border bg-card p-4">
      {selecting && mine && (
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(v === true)}
          aria-label="Select post"
          className="mt-1"
        />
      )}
      <UserAvatar user={tweet.owner} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
          <span className="text-sm font-medium text-foreground">{tweet.owner.fullName}</span>
          <span>@{tweet.owner.username}</span>
          <span>· {timeAgo(tweet.createdAt)}</span>
          {tweet.updatedAt && tweet.updatedAt !== tweet.createdAt && <span>(edited)</span>}
        </div>
        {editing ? (
          <form onSubmit={(event) => void save(event)} className="mt-2 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX}
              autoFocus
              aria-label="Edit post"
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
                  setDraft(tweet.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-1 text-sm break-words whitespace-pre-wrap">{tweet.content}</p>
        )}
        {!editing && (
          <div className="mt-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void like()}
              aria-pressed={!!tweet.isLiked}
              aria-label="Like post"
            >
              <Heart className={cn(tweet.isLiked && "fill-current text-destructive")} />
              {formatCount(tweet.likesCount ?? 0)}
            </Button>
            {mine && !selecting && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit post"
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setConfirmOpen(true)}
                  aria-label="Delete post"
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
        title="Delete post?"
        description="This cannot be undone."
        onConfirm={remove}
      />
    </li>
  );
}

/** Controlled list of tweets with like / edit / delete and (for the owner) bulk delete. */
export function TweetList({
  tweets,
  onChange,
}: {
  tweets: Tweet[];
  onChange: (updater: (current: Tweet[]) => Tweet[]) => void;
}) {
  const me = useCurrentUser();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mineCount = tweets.filter((t) => t.owner._id === me._id).length;

  const bulkDelete = async () => {
    const ids = [...selected];
    try {
      const count = await deleteTweets(ids);
      onChange((list) => list.filter((t) => !selected.has(t._id)));
      setSelected(new Set());
      setSelecting(false);
      toast.success(`Deleted ${count} ${plural(count, "post")}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (tweets.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No posts yet"
        description="Short updates appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {mineCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          {selecting ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelecting(false);
                  setSelected(new Set());
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selected.size === 0}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 /> Delete {selected.size || ""} selected
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setSelecting(true)}>
              Select posts
            </Button>
          )}
        </div>
      )}
      <ul className="space-y-3">
        {tweets.map((tweet) => (
          <TweetItem
            key={tweet._id}
            tweet={tweet}
            selecting={selecting}
            selected={selected.has(tweet._id)}
            onSelect={(checked) =>
              setSelected((current) => {
                const next = new Set(current);
                if (checked) next.add(tweet._id);
                else next.delete(tweet._id);
                return next;
              })
            }
            onChange={(next) =>
              onChange((list) => list.map((t) => (t._id === next._id ? next : t)))
            }
            onRemove={(id) => onChange((list) => list.filter((t) => t._id !== id))}
          />
        ))}
      </ul>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${selected.size} ${plural(selected.size, "post")}?`}
        description="This cannot be undone."
        onConfirm={bulkDelete}
      />
    </div>
  );
}
