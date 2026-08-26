import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlaylist, removeVideoFromPlaylist, deletePlaylist } from "../api/playlists";
import type { Playlist } from "../types/playlist";
import { getApiErrorMessage } from "../utils/apiError";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { PlaylistHeader } from "../components/playlist/PlaylistHeader";
import { PlaylistVideoList } from "../components/playlist/PlaylistVideoList";
import { EditPlaylistModal } from "../components/playlist/EditPlaylistModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { ListVideo } from "lucide-react";

export default function PlaylistDetailPage() {
  const { playlistId = "" } = useParams<{ playlistId: string }>(); const navigate = useNavigate(); const [playlist, setPlaylist] = useState<Playlist | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [editing, setEditing] = useState(false); const [deleting, setDeleting] = useState(false); const [removing, setRemoving] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setPlaylist(await getPlaylist(playlistId)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlist could not be loaded.")); } finally { setLoading(false); } }, [playlistId]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const remove = async (videoId: string) => { setRemoving(videoId); try { const updated = await removeVideoFromPlaylist(playlistId, videoId); setPlaylist(updated); } catch (requestError) { setError(getApiErrorMessage(requestError, "Video could not be removed.")); } finally { setRemoving(""); } };
  const removePlaylist = async () => { try { await deletePlaylist(playlistId); navigate("/playlists", { replace: true }); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlist could not be deleted.")); setDeleting(false); } };
  if (loading) return <AppShell><PageContainer><Skeleton className="h-44 rounded-2xl" /><Skeleton className="mt-8 h-72 rounded-2xl" /></PageContainer></AppShell>;
  if (error || !playlist) return <AppShell><PageContainer><ErrorState title="Playlist unavailable" description={error || "This playlist could not be found."} action={<Button onClick={() => navigate("/playlists")}>Back to playlists</Button>} /></PageContainer></AppShell>;
  return <AppShell><PageContainer><div className="space-y-8"><PlaylistHeader playlist={playlist} onEdit={() => setEditing(true)} onDelete={() => setDeleting(true)} />{playlist.videos.length ? <PlaylistVideoList playlist={playlist} onRemove={(videoId) => { if (!removing) void remove(videoId); }} /> : <EmptyState icon={<ListVideo size={30} />} title="This playlist is empty" description="Add videos from the watch page to fill this collection." />}</div><EditPlaylistModal key={editing ? playlist._id : "closed"} playlist={editing ? playlist : null} onClose={() => setEditing(false)} onUpdated={setPlaylist} /><ConfirmDialog open={deleting} title="Delete this playlist?" description="This permanently deletes the playlist. The videos themselves will not be deleted." confirmLabel="Delete playlist" onClose={() => setDeleting(false)} onConfirm={() => void removePlaylist()} /></PageContainer></AppShell>;
}
