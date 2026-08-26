import { useEffect, useState } from "react";
import { Eye, Heart, Users, Video } from "lucide-react";
import { getStudioStats } from "../api/studio";
import { StudioShell } from "../components/layout/StudioShell";
import { StatCard } from "../components/studio/StatCard";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import { getApiErrorMessage } from "../utils/apiError";
import type { StudioStats } from "../types/studio";

export default function StudioDashboardPage() {
  const [stats, setStats] = useState<StudioStats | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let active = true; getStudioStats().then((result) => { if (active) setStats(result); }).catch((requestError) => { if (active) setError(getApiErrorMessage(requestError, "Studio stats could not be loaded.")); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const number = (value?: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value || 0);
  return <StudioShell><div className="max-w-5xl"><div className="mb-8"><p className="text-sm text-amber-300">Overview</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Your channel at a glance.</h2></div>{loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}</div> : error ? <ErrorState description={error} /> : stats && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Subscribers" value={number(stats.totalSubscribers)} icon={Users} accent="bg-cyan-400/10 text-cyan-300" /><StatCard label="Total videos" value={number(stats.stats?.totalVideos)} icon={Video} accent="bg-amber-300/10 text-amber-200" /><StatCard label="Total views" value={number(stats.stats?.totalViews)} icon={Eye} accent="bg-emerald-400/10 text-emerald-300" /><StatCard label="Video likes" value={number(stats.likesData?.totalLikes)} icon={Heart} accent="bg-rose-400/10 text-rose-300" /></div>}</div></StudioShell>;
}
