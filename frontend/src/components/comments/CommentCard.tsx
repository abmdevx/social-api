import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import type { Comment } from "../../types/comment";
import { CommentLikeButton } from "./CommentLikeButton";

export function CommentCard({ comment, currentUserId, onUpdate, onDelete }: { comment: Comment; currentUserId?: string; onUpdate: (content: string) => Promise<void>; onDelete: () => Promise<void> }) {
  const isOwner = Boolean(currentUserId && comment.owner === currentUserId);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const date = comment.createdAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(comment.createdAt)) : "Recently";
  const save = async () => { if (!content.trim()) return; await onUpdate(content.trim()); setEditing(false); };
  return <article className="flex gap-3"><Avatar name="User" size="sm" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-300">User</span><span className="text-xs text-slate-600">{date}</span></div>{editing ? <div className="mt-2 space-y-2"><textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 outline-none focus:border-cyan-400/70" /><div className="flex gap-2"><Button size="sm" variant="primary" onClick={() => void save()}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div></div> : <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">{comment.content}</p>}<div className="mt-2 flex items-center gap-1"><CommentLikeButton commentId={comment._id} />{isOwner && !editing && <><Button size="sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit comment"><Pencil size={13} />Edit</Button><Button size="sm" variant="ghost" onClick={() => void onDelete()} aria-label="Delete comment"><Trash2 size={13} />Delete</Button></>}</div></div></article>;
}
