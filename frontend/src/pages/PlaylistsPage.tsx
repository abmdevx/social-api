import { useCallback, useEffect, useState } from "react";
import { Plus, ListVideo } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { useAuth } from "../context/useAuth";
import { getPlaylists } from "../api/playlists";
import type { Playlist } from "../types/playlist";
import { getApiErrorMessage } from "../utils/apiError";
import { Button } from "../components/ui/Button";
import { PlaylistGrid } from "../components/playlist/PlaylistGrid";
import { CreatePlaylistModal } from "../components/playlist/CreatePlaylistModal";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";

export default function PlaylistsPage() {
  const { user } = useAuth(); const [playlists, setPlaylists] = useState<Playlist[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [createOpen, setCreateOpen] = useState(false);
  const load = useCallback(async () => { if (!user) return; setLoading(true); setError(""); try { setPlaylists(await getPlaylists(user._id)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlists could not be loaded.")); } finally { setLoading(false); } }, [user]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  return <AppShell><PageContainer><div className="flex flex-col gap-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-cyan-400">Your collection</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Playlists</h1><p className="mt-2 text-sm text-slate-500">Keep the videos worth returning to in one place.</p></div><Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={16} />Create playlist</Button></div>{loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-48 rounded-2xl" />)}</div> : error ? <ErrorState description={error} action={<Button onClick={() => void load()}>Try again</Button>} /> : playlists.length ? <PlaylistGrid playlists={playlists} /> : <EmptyState icon={<ListVideo size={30} />} title="No playlists yet" description="Create a playlist to organize your favorite videos." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={16} />Create playlist</Button>} />}</div><CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void load()} /></PageContainer></AppShell>;
}
