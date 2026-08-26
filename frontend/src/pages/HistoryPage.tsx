import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { getWatchHistory } from "../api/personal";
import type { Video } from "../types/video";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { HistoryList } from "../components/video/HistoryList";
import { VideoGridSkeleton } from "../components/video/VideoGridSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { getApiErrorMessage } from "../utils/apiError";

export default function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setVideos(await getWatchHistory()); } catch (requestError) { setError(getApiErrorMessage(requestError, "Watch history could not be loaded.")); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return <AppShell><PageContainer><div className="space-y-8"><div><p className="flex items-center gap-2 text-sm font-medium text-cyan-400"><History size={16} />Your activity</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Watch history</h1><p className="mt-2 text-sm text-slate-500">Pick up where you left off.</p></div>{loading ? <VideoGridSkeleton /> : error ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : videos.length ? <HistoryList videos={videos} /> : <EmptyState icon={<History size={30} />} title="Your history is empty" description="Videos you watch will show up here." />}</div></PageContainer></AppShell>;
}
