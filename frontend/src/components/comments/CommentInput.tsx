import { useState } from "react";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export function CommentInput({ onSubmit, loading }: { onSubmit: (content: string) => Promise<void>; loading: boolean }) {
  const [content, setContent] = useState("");
  const { user } = useAuth(); const navigate = useNavigate();
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!user) { navigate("/login"); return; } if (!content.trim()) return; await onSubmit(content.trim()); setContent(""); };
  return <form onSubmit={submit} className="space-y-3"><Textarea id="comment" aria-label="Add a comment" placeholder="Add to the conversation..." value={content} onChange={(event) => setContent(event.target.value)} rows={3} /><div className="flex justify-end"><Button variant="primary" size="sm" disabled={loading || !content.trim()}>{loading ? "Posting..." : "Post comment"}</Button></div></form>;
}
