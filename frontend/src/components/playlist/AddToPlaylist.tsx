import { ListPlus } from "lucide-react";
import { useState } from "react";
import { addVideoToPlaylist, getUserPlaylists } from "../../api/watch";
import type { Playlist } from "../../types/playlist";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { getApiErrorMessage } from "../../utils/apiError";

export function AddToPlaylist({ videoId, userId }: { videoId: string; userId?: string }) {
  const [open, setOpen] = useState(false); const [playlists, setPlaylists] = useState<Playlist[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [saved, setSaved] = useState("");
  const openPicker = async () => { if (!userId) return; setOpen(true); setLoading(true); setError(""); try { setPlaylists(await getUserPlaylists(userId)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlists could not be loaded.")); } finally { setLoading(false); } };
  const save = async (playlistId: string) => { setLoading(true); setError(""); try { await addVideoToPlaylist(playlistId, videoId); setSaved("Saved to playlist"); } catch (requestError) { setError(getApiErrorMessage(requestError, "Video could not be saved.")); } finally { setLoading(false); } };
  return <><Button variant="secondary" size="sm" onClick={() => void openPicker()} disabled={!userId}><ListPlus size={16} />Save</Button><Modal open={open} title="Save to playlist" onClose={() => setOpen(false)}>{loading && !playlists.length ? <p className="text-sm text-slate-500">Loading playlists...</p> : error ? <p className="text-sm text-rose-300">{error}</p> : saved ? <p className="text-sm text-emerald-300">{saved}</p> : playlists.length ? <div className="space-y-2">{playlists.map((playlist) => <Button key={playlist._id} variant="ghost" className="w-full justify-start" onClick={() => void save(playlist._id)}>{playlist.playlistName}</Button>)}</div> : <p className="text-sm text-slate-500">You do not have any playlists yet.</p>}</Modal></>;
}
