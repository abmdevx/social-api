import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getLikedVideos } from "../api/personal";
import type { Video } from "../types/video";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoGridSkeleton } from "../components/video/VideoGridSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { getApiErrorMessage } from "../utils/apiError";

export default function LikedVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setVideos(await getLikedVideos()); } catch (requestError) { setError(getApiErrorMessage(requestError, "Liked videos could not be loaded.")); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return <AppShell><PageContainer><div className="space-y-8"><div><p className="flex items-center gap-2 text-sm font-medium text-rose-300"><Heart size={16} />Your collection</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Liked videos</h1><p className="mt-2 text-sm text-slate-500">The videos you chose to keep close.</p></div>{loading ? <VideoGridSkeleton /> : error ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : videos.length ? <VideoGrid videos={videos} /> : <EmptyState icon={<Heart size={30} />} title="No liked videos yet" description="Like a video and it will be saved here." />}</div></PageContainer></AppShell>;
}
