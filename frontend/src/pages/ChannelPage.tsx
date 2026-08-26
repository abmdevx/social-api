import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getChannel, getChannelPlaylists, getChannelTweets, getChannelVideos } from "../api/channel";
import { useAuth } from "../context/useAuth";
import type { Channel } from "../types/channel";
import type { Playlist } from "../types/playlist";
import type { Tweet } from "../types/tweet";
import type { Video } from "../types/video";
import { getApiErrorMessage } from "../utils/apiError";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { ChannelHeader } from "../components/channel/ChannelHeader";
import { ChannelTabs } from "../components/channel/ChannelTabs";
import { ChannelVideoGrid } from "../components/channel/ChannelVideoGrid";
import { ChannelTweetList } from "../components/channel/ChannelTweetList";
import { ChannelPlaylistList } from "../components/channel/ChannelPlaylistList";
import { VideoGridSkeleton } from "../components/video/VideoGridSkeleton";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";

export default function ChannelPage() {
  const { username = "" } = useParams<{ username: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState("");
  const tab = location.pathname.endsWith("/tweets") ? "tweets" : location.pathname.endsWith("/playlists") ? "playlists" : "videos";
  const isOwnChannel = Boolean(user && channel && user._id === channel._id);

  useEffect(() => { let active = true; const load = async () => { setLoading(true); setError(""); try { const result = await getChannel(username); if (active) setChannel(result); } catch (requestError) { if (active) setError(getApiErrorMessage(requestError, "Channel could not be loaded.")); } finally { if (active) setLoading(false); } }; if (username) void load(); return () => { active = false; }; }, [username]);
  useEffect(() => { if (!channel) return; let active = true; const loadTab = async () => { setContentLoading(true); setError(""); try { if (tab === "videos") setVideos(await getChannelVideos(channel._id)); if (tab === "playlists") setPlaylists(await getChannelPlaylists(channel._id)); if (tab === "tweets" && isOwnChannel) setTweets(await getChannelTweets()); } catch (requestError) { if (active) setError(getApiErrorMessage(requestError, "This channel section could not be loaded.")); } finally { if (active) setContentLoading(false); } }; void loadTab(); return () => { active = false; }; }, [channel, tab, isOwnChannel]);

  if (loading) return <AppShell><PageContainer><div className="space-y-6"><Skeleton className="h-52 rounded-2xl" /><Skeleton className="h-10 w-64" /><VideoGridSkeleton count={4} /></div></PageContainer></AppShell>;
  if (error && !channel) return <AppShell><PageContainer><ErrorState title="Channel unavailable" description={error} /></PageContainer></AppShell>;
  if (!channel) return null;
  return <AppShell><PageContainer><div className="space-y-6"><ChannelHeader channel={channel} onSubscribed={(value) => setChannel({ ...channel, isSubscribed: value, subscribersCount: channel.subscribersCount + (value ? 1 : -1) })} /><ChannelTabs username={channel.username} />{contentLoading ? <VideoGridSkeleton count={4} /> : error ? <ErrorState description={error} action={<Button onClick={() => window.location.reload()}>Try again</Button>} /> : tab === "videos" ? videos.length ? <ChannelVideoGrid videos={videos} /> : <EmptyState title="No videos yet" description="Published videos from this channel will appear here." /> : tab === "playlists" ? <ChannelPlaylistList playlists={playlists} /> : <ChannelTweetList tweets={tweets.filter((tweet) => tweet.owner === channel._id)} unavailable={!isOwnChannel} />}</div></PageContainer></AppShell>;
}
