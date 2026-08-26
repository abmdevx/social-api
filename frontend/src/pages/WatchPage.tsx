import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVideo, getSubscriberInfo } from "../api/watch";
import { useAuth } from "../context/useAuth";
import type { Video } from "../types/video";
import { getApiErrorMessage } from "../utils/apiError";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { VideoPlayer } from "../components/video/VideoPlayer";
import { VideoHeader } from "../components/video/VideoHeader";
import { VideoActions } from "../components/video/VideoActions";
import { ChannelInfo } from "../components/channel/ChannelInfo";
import { Description } from "../components/video/Description";
import { CommentsSection } from "../components/comments/CommentsSection";
import { AddToPlaylist } from "../components/playlist/AddToPlaylist";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>(); const navigate = useNavigate(); const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null); const [subscribed, setSubscribed] = useState(false); const [subscriberCount, setSubscriberCount] = useState<number | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; const load = async () => { if (!videoId) return; setLoading(true); setError(""); try { const result = await getVideo(videoId); if (!active) return; setVideo(result); const channelId = typeof result.owner === "string" ? result.owner : result.owner?._id; if (channelId) { try { const info = await getSubscriberInfo(channelId); if (active) { setSubscriberCount(info.subscriberCount); setSubscribed(info.subscribers?.some((subscriber) => subscriber._id === user?._id) || false); } } catch { if (active) setSubscriberCount(null); } } } catch (requestError) { if (active) setError(getApiErrorMessage(requestError, "This video could not be loaded.")); } finally { if (active) setLoading(false); } }; void load(); return () => { active = false; }; }, [videoId, user?._id]);
  if (loading) return <AppShell><PageContainer><div className="space-y-6"><Skeleton className="aspect-video rounded-2xl" /><Skeleton className="h-8 w-2/3" /><Skeleton className="h-20 w-full" /></div></PageContainer></AppShell>;
  if (error || !video) return <AppShell><PageContainer><ErrorState title="Video unavailable" description={error || "This video could not be found."} action={<Button onClick={() => navigate("/")}>Back to home</Button>} /></PageContainer></AppShell>;
  const channelId = typeof video.owner === "string" ? video.owner : video.owner?._id || ""; const channelName = typeof video.owner === "object" ? video.owner.username : "Channel"; const avatar = typeof video.owner === "object" ? video.owner.avatar?.url : undefined;
  return <AppShell><PageContainer><div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="min-w-0 space-y-5"><VideoPlayer video={video} /><div className="flex flex-col gap-4"><VideoHeader video={video} /><div className="flex flex-wrap items-center justify-between gap-3"><VideoActions videoId={video._id} /><AddToPlaylist videoId={video._id} userId={user?._id} /></div></div><ChannelInfo channelId={channelId} name={channelName} avatar={avatar} subscriberCount={subscriberCount} subscribed={subscribed} onSubscribed={setSubscribed} /><Description text={video.description} /></div><aside className="xl:pt-1"><CommentsSection videoId={video._id} /></aside></div></PageContainer></AppShell>;
}
