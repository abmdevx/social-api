import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Bell,
  BellRing,
  ListVideo,
  MessageSquare,
  Settings,
  UserX,
  Video as VideoIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getPlaylists } from "@/api/playlists";
import { toggleSubscription } from "@/api/subscriptions";
import { getTweets } from "@/api/tweets";
import { getChannel } from "@/api/users";
import { getVideos } from "@/api/videos";
import { PlaylistCard } from "@/components/common/PlaylistCard";
import { EmptyState, ErrorState, PageSpinner, VideoGridSkeleton } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { VideoGrid } from "@/components/common/VideoCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, plural } from "@/lib/format";
import type { Channel as ChannelModel } from "@/types/models";
import { TweetList } from "./TweetList";

function ChannelVideos({ channelId }: { channelId: string }) {
  const { data, error, loading, reload } = useAsync(
    () => getVideos({ userId: channelId, limit: 24, sortBy: "createdAt", sortType: "desc" }),
    [channelId]
  );
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <VideoGridSkeleton count={4} /> : null;
  if (data.docs.length === 0)
    return (
      <EmptyState
        icon={VideoIcon}
        title="No videos yet"
        description="This channel hasn't published anything."
      />
    );
  return <VideoGrid videos={data.docs} />;
}

function ChannelPosts({ channelId }: { channelId: string }) {
  const { data, error, loading, reload, setData } = useAsync(
    () => getTweets(channelId),
    [channelId]
  );
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <PageSpinner /> : null;
  return (
    <TweetList
      tweets={data}
      onChange={(updater) => setData((current) => (current ? updater(current) : current))}
    />
  );
}

function ChannelPlaylists({ channelId }: { channelId: string }) {
  const { data, error, loading, reload } = useAsync(() => getPlaylists(channelId), [channelId]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <PageSpinner /> : null;
  const visible = data.filter((p) => p.videos.length > 0 || p.owner === channelId);
  if (visible.length === 0) return <EmptyState icon={ListVideo} title="No playlists" />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((playlist) => (
        <PlaylistCard key={playlist._id} playlist={playlist} />
      ))}
    </div>
  );
}

function ChannelView({
  channel,
  onChange,
}: {
  channel: ChannelModel;
  onChange: (channel: ChannelModel) => void;
}) {
  const me = useCurrentUser();
  const isMe = channel._id === me._id;
  const [busy, setBusy] = useState(false);

  const subscribe = async () => {
    setBusy(true);
    try {
      const state = await toggleSubscription(channel._id);
      onChange({
        ...channel,
        isSubscribed: state.subscribed,
        subscribersCount: state.subscribersCount,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="h-32 overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 sm:h-48">
        {channel.coverImage?.url && (
          <img src={channel.coverImage.url} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar user={channel} className="size-20 sm:size-24" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight">{channel.fullName}</h1>
          <p className="text-sm text-muted-foreground">
            @{channel.username} · {formatCount(channel.subscribersCount)}{" "}
            {plural(channel.subscribersCount, "subscriber")} ·{" "}
            {formatCount(channel.channelsSubscribedCount)} subscribed
          </p>
        </div>
        {isMe ? (
          <Button asChild variant="outline">
            <Link to="/settings">
              <Settings /> Edit profile
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => void subscribe()}
            disabled={busy}
            variant={channel.isSubscribed ? "secondary" : "default"}
            aria-pressed={channel.isSubscribed}
            className="rounded-full"
          >
            {channel.isSubscribed ? <BellRing /> : <Bell />}
            {channel.isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos">
            <VideoIcon /> Videos
          </TabsTrigger>
          <TabsTrigger value="posts">
            <MessageSquare /> Community
          </TabsTrigger>
          <TabsTrigger value="playlists">
            <ListVideo /> Playlists
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="pt-4">
          <ChannelVideos channelId={channel._id} />
        </TabsContent>
        <TabsContent value="posts" className="pt-4">
          <ChannelPosts channelId={channel._id} />
        </TabsContent>
        <TabsContent value="playlists" className="pt-4">
          <ChannelPlaylists channelId={channel._id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Channel() {
  const { username = "" } = useParams();
  const { data, error, loading, reload, setData } = useAsync(
    () => getChannel(username),
    [username]
  );
  if (error) {
    return /not found/i.test(error) ? (
      <EmptyState
        icon={UserX}
        title="Channel not found"
        description={`There is no user called @${username}.`}
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
  if (!data || data.username !== username.toLowerCase())
    return loading || data ? <PageSpinner /> : null;
  return <ChannelView key={data._id} channel={data} onChange={(next) => setData(next)} />;
}
