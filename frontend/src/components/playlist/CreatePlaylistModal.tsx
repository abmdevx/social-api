import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Modal } from "../ui/Modal";
import { createPlaylist } from "../../api/playlists";
import { getApiErrorMessage } from "../../utils/apiError";

export function CreatePlaylistModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [videoIds, setVideoIds] = useState(""); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const ids = videoIds.split(",").map((id) => id.trim()).filter(Boolean); if (!name.trim() || !ids.length) { setError("A playlist name and at least one video ID are required by the backend."); return; } setLoading(true); setError(""); try { await createPlaylist(name.trim(), description.trim(), ids); setName(""); setDescription(""); setVideoIds(""); onCreated(); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Playlist could not be created.")); } finally { setLoading(false); } };
  return <Modal open={open} title="Create playlist" onClose={onClose}><form onSubmit={submit} className="space-y-4"><Input id="playlist-name" label="Name" value={name} onChange={(event) => setName(event.target.value)} required /><Textarea id="playlist-description" label="Description" value={description} onChange={(event) => setDescription(event.target.value)} /><Textarea id="playlist-video-ids" label="Video IDs" value={videoIds} onChange={(event) => setVideoIds(event.target.value)} placeholder="Paste one or more video IDs, separated by commas" required />{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={loading}>{loading ? "Creating..." : "Create playlist"}</Button></div></form></Modal>;
}
