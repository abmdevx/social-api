import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createTweet, getTweets } from "@/api/tweets";
import { ErrorState, PageHeader, PageSpinner } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { TweetList } from "./TweetList";

const MAX = 280;

export default function Tweets() {
  const me = useCurrentUser();
  const { data, error, loading, reload, setData } = useAsync(() => getTweets(), []);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const post = async (event: FormEvent) => {
    event.preventDefault();
    const content = text.trim();
    if (!content) return;
    setPosting(true);
    try {
      await createTweet(content);
      setText("");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Community" description="Share short updates with your subscribers." />
      <form
        onSubmit={(event) => void post(event)}
        className="mb-6 flex gap-3 rounded-xl border bg-card p-4"
      >
        <UserAvatar user={me} />
        <div className="flex-1 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={MAX}
            rows={2}
            aria-label="New post"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length}/{MAX}
            </span>
            <Button type="submit" size="sm" disabled={posting || !text.trim()}>
              {posting && <Loader2 className="animate-spin" />} Post
            </Button>
          </div>
        </div>
      </form>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <PageSpinner />
      ) : (
        <TweetList
          tweets={data}
          onChange={(updater) => setData((current) => (current ? updater(current) : current))}
        />
      )}
    </div>
  );
}
