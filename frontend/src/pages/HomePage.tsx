import { useEffect, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { getVideos } from "../api/videos";
import type { Video } from "../types/video";
import { getApiErrorMessage } from "../utils/apiError";
import { VideoEmptyState } from "../components/video/VideoEmptyState";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoGridSkeleton } from "../components/video/VideoGridSkeleton";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true); setError(""); setPage(1);
      try {
        const result = await getVideos({ page: 1, limit: 12, query: query || undefined, sortBy: "createdAt", sortType: "desc" });
        if (active) { setVideos(result.docs || []); setTotalPages(result.totalPages || 1); }
      } catch (loadError) { if (active) setError(getApiErrorMessage(loadError, "Videos could not be loaded.")); }
      finally { if (active) setIsLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [query, reloadKey]);

  const loadMore = async () => {
    if (page >= totalPages || isLoadingMore) return;
    setIsLoadingMore(true); setError("");
    try { const nextPage = page + 1; const result = await getVideos({ page: nextPage, limit: 12, query: query || undefined, sortBy: "createdAt", sortType: "desc" }); setVideos((current) => [...current, ...(result.docs || [])]); setPage(nextPage); }
    catch (loadError) { setError(getApiErrorMessage(loadError, "More videos could not be loaded.")); }
    finally { setIsLoadingMore(false); }
  };

  return <AppShell onSearch={setQuery}><PageContainer><div className="flex flex-col gap-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-cyan-400">Your next watch</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">Discover something worth sharing.</h1><p className="mt-3 text-sm text-slate-500">Fresh picks from the Streamline community.</p></div><Button variant="ghost" size="sm"><SlidersHorizontal size={16} />Latest</Button></div>{isLoading ? <VideoGridSkeleton count={8} /> : error && videos.length === 0 ? <ErrorState description={error} action={<Button onClick={() => setReloadKey((key) => key + 1)}><RefreshCw size={15} />Try again</Button>} /> : videos.length === 0 ? <VideoEmptyState searching={Boolean(query)} /> : <><VideoGrid videos={videos} />{error && <p role="alert" className="text-center text-sm text-rose-300">{error}</p>}{page < totalPages && <div className="flex justify-center"><Button onClick={() => void loadMore()} disabled={isLoadingMore}>{isLoadingMore ? "Loading..." : "Load more"}</Button></div>}</>}</div></PageContainer></AppShell>;
}
