import { useState } from "react";
import type { Playlist } from "../../types/playlist";
import { updatePlaylist } from "../../api/playlists";
import { getApiErrorMessage } from "../../utils/apiError";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Modal } from "../ui/Modal";

export function EditPlaylistModal({ playlist, onClose, onUpdated }: { playlist: Playlist | null; onClose: () => void; onUpdated: (playlist: Playlist) => void }) {
  const [name, setName] = useState(playlist?.playlistName || ""); const [description, setDescription] = useState(playlist?.playlistDescription || ""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!playlist || !name.trim()) return; setLoading(true); setError(""); try { onUpdated(await updatePlaylist(playlist._id, name.trim(), description.trim())); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlist could not be updated.")); } finally { setLoading(false); } };
  return <Modal open={Boolean(playlist)} title="Edit playlist" onClose={onClose}><form onSubmit={submit} className="space-y-4"><Input id="edit-playlist-name" label="Name" value={name} onChange={(event) => setName(event.target.value)} required /><Textarea id="edit-playlist-description" label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button></div></form></Modal>;
}
