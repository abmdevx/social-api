import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bell, BellRing, ThumbsUp, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { toggleSubscription } from "@/api/subscriptions";
import { getVideo, toggleVideoLike } from "@/api/videos";
import { EmptyState, ErrorState, PageSpinner } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, formatDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Comments } from "./watch/Comments";
import { SaveToPlaylist } from "./watch/SaveToPlaylist";

export default function Watch() {
  const { videoId = "" } = useParams();
  const me = useCurrentUser();
  const {
    data: video,
    error,
    loading,
    reload,
    setData,
  } = useAsync(() => getVideo(videoId), [videoId]);
  const [liking, setLiking] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return /not found/i.test(error) ? (
      <EmptyState
        icon={VideoOff}
        title="Video unavailable"
        description="It may have been removed or made private."
        action={
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error} onRetry={reload} />
    );
  }
  if (!video) return loading ? <PageSpinner /> : null;
  if (video._id !== videoId) return <PageSpinner />;

  const isOwner = video.owner._id === me._id;

  const like = async () => {
    setLiking(true);
    try {
      const state = await toggleVideoLike(video._id);
      setData((v) => (v ? { ...v, isLiked: state.liked, likesCount: state.likesCount } : v));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLiking(false);
    }
  };

  const subscribe = async () => {
    setSubscribing(true);
    try {
      const state = await toggleSubscription(video.owner._id);
      setData((v) =>
        v
          ? {
              ...v,
              owner: {
                ...v.owner,
                isSubscribed: state.subscribed,
                subscribersCount: state.subscribersCount,
              },
            }
          : v
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        {video.videoFile?.url ? (
          <video
            key={video._id}
            src={video.videoFile.url}
            poster={video.thumbnail?.url}
            controls
            playsInline
            preload="metadata"
            className="size-full"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-white/70">
            Video file unavailable
          </div>
        )}
      </div>

      <h1 className="text-xl leading-snug font-semibold">{video.title}</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={`/c/${video.owner.username}`}>
            <UserAvatar user={video.owner} className="size-10" />
          </Link>
          <div className="min-w-0">
            <Link
              to={`/c/${video.owner.username}`}
              className="block truncate text-sm font-semibold"
            >
              {video.owner.fullName}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatCount(video.owner.subscribersCount)}{" "}
              {plural(video.owner.subscribersCount, "subscriber")}
            </span>
          </div>
          {!isOwner && (
            <Button
              variant={video.owner.isSubscribed ? "secondary" : "default"}
              onClick={() => void subscribe()}
              disabled={subscribing}
              aria-pressed={video.owner.isSubscribed}
              className="ml-2 rounded-full"
            >
              {video.owner.isSubscribed ? <BellRing /> : <Bell />}
              {video.owner.isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => void like()}
            disabled={liking}
            aria-pressed={video.isLiked}
          >
            <ThumbsUp className={cn(video.isLiked && "fill-current")} />
            {formatCount(video.likesCount)}
          </Button>
          <SaveToPlaylist videoId={video._id} />
        </div>
      </div>

      <div className="rounded-xl bg-muted/60 p-4 text-sm">
        <p className="font-medium">
          {formatCount(video.views)} {plural(video.views, "view")} · {formatDate(video.createdAt)}
        </p>
        {video.description && (
          <>
            <p className={cn("mt-2 break-words whitespace-pre-wrap", !expanded && "line-clamp-3")}>
              {video.description}
            </p>
            {video.description.length > 160 && (
              <button
                className="mt-1 font-medium underline-offset-4 hover:underline"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </>
        )}
      </div>

      <Comments videoId={video._id} />
    </div>
  );
}
