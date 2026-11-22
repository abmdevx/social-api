import { History as HistoryIcon, ThumbsUp, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getSubscribedChannels, toggleSubscription } from "@/api/subscriptions";
import { getWatchHistory } from "@/api/users";
import { getLikedVideos } from "@/api/videos";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  VideoGridSkeleton,
  PageSpinner,
} from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { VideoGrid } from "@/components/common/VideoCard";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, plural } from "@/lib/format";

export function History() {
  const { data, error, loading, reload } = useAsync(getWatchHistory, []);
  return (
    <div>
      <PageHeader title="Watch history" description="Videos you've watched recently." />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <VideoGridSkeleton count={4} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nothing watched yet"
          description="Videos you watch will show up here."
        />
      ) : (
        <VideoGrid videos={data} />
      )}
    </div>
  );
}

export function LikedVideos() {
  const { data, error, loading, reload } = useAsync(getLikedVideos, []);
  return (
    <div>
      <PageHeader title="Liked videos" description="Everything you've given a thumbs up." />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <VideoGridSkeleton count={4} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={ThumbsUp}
          title="No liked videos"
          description="Like a video and it will be saved here."
        />
      ) : (
        <VideoGrid videos={data} />
      )}
    </div>
  );
}

export function Subscriptions() {
  const me = useCurrentUser();
  const { data, error, loading, reload, setData } = useAsync(
    () => getSubscribedChannels(me._id),
    [me._id]
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unsubscribe = async (channelId: string) => {
    setPendingId(channelId);
    try {
      await toggleSubscription(channelId);
      setData((current) =>
        current
          ? {
              subscribedChannelsCount: Math.max(0, current.subscribedChannelsCount - 1),
              channels: current.channels.filter((channel) => channel._id !== channelId),
            }
          : current
      );
      toast.success("Unsubscribed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };
  return (
    <div>
      <PageHeader title="Subscriptions" description="Channels you follow." />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <PageSpinner />
      ) : data.channels.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No subscriptions"
          description="Subscribe to channels to follow them here."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {formatCount(data.subscribedChannelsCount)}{" "}
            {plural(data.subscribedChannelsCount, "channel")}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.channels.map((channel) => (
              <li
                key={channel._id}
                className="flex items-center gap-2 rounded-xl border bg-card p-3"
              >
                <Link
                  to={`/c/${channel.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <UserAvatar user={channel} className="size-12" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{channel.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">@{channel.username}</p>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pendingId === channel._id}
                  onClick={() => void unsubscribe(channel._id)}
                >
                  Unsubscribe
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
