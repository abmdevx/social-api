import { useState } from "react";
import type { Tweet } from "../../types/tweet";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { getApiErrorMessage } from "../../utils/apiError";

export function EditTweetModal({ tweet, onClose, onUpdated }: { tweet: Tweet | null; onClose: () => void; onUpdated: (tweet: Tweet) => Promise<void> }) {
  const [content, setContent] = useState(tweet?.content || ""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!tweet || !content.trim()) return; setLoading(true); setError(""); try { await onUpdated({ ...tweet, content: content.trim() }); onClose(); } catch (requestError) { setError(getApiErrorMessage(requestError, "Tweet could not be updated.")); } finally { setLoading(false); } };
  return <Modal open={Boolean(tweet)} title="Edit tweet" onClose={onClose}><form onSubmit={submit} className="space-y-4"><Textarea id="edit-tweet" label="Content" value={content} onChange={(event) => setContent(event.target.value)} maxLength={280} required />{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary" disabled={loading || !content.trim()}>{loading ? "Saving..." : "Save changes"}</Button></div></form></Modal>;
}
