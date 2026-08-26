import { useCallback, useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { getSubscribedChannels } from "../api/personal";
import { useAuth } from "../context/useAuth";
import type { Channel } from "../types/channel";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { SubscriptionList } from "../components/channel/SubscriptionList";
import { VideoGridSkeleton } from "../components/video/VideoGridSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { getApiErrorMessage } from "../utils/apiError";

export default function SubscriptionsPage() {
  const { user } = useAuth(); const [channels, setChannels] = useState<Channel[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { if (!user) return; setLoading(true); setError(""); try { const result = await getSubscribedChannels(user._id); setChannels(result.channels || []); } catch (requestError) { setError(getApiErrorMessage(requestError, "Subscriptions could not be loaded.")); } finally { setLoading(false); } }, [user]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const unsubscribe = (channelId: string) => setChannels((current) => current.filter((channel) => channel._id !== channelId));
  return <AppShell><PageContainer><div className="space-y-8"><div><p className="flex items-center gap-2 text-sm font-medium text-cyan-400"><UsersRound size={16} />Your network</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Subscriptions</h1><p className="mt-2 text-sm text-slate-500">Channels you have chosen to follow.</p></div>{loading ? <div className="space-y-3"><VideoGridSkeleton count={3} /></div> : error ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : channels.length ? <SubscriptionList channels={channels} onUnsubscribed={unsubscribe} /> : <EmptyState icon={<UsersRound size={30} />} title="No subscriptions yet" description="Follow a channel to see it in your network." />}</div></PageContainer></AppShell>;
}
