import { Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleCommentLike } from "../../api/watch";
import { useAuth } from "../../context/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { Button } from "../ui/Button";

export function CommentLikeButton({ commentId, initialLiked = false }: { commentId: string; initialLiked?: boolean }) {
  const { user } = useAuth(); const navigate = useNavigate(); const [liked, setLiked] = useState(initialLiked); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const toggle = async () => { if (!user) { navigate("/login"); return; } setLoading(true); setError(""); try { setLiked(await toggleCommentLike(commentId)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Comment like could not be updated.")); } finally { setLoading(false); } };
  return <div><Button size="sm" variant="ghost" onClick={() => void toggle()} disabled={loading} aria-label={liked ? "Unlike comment" : "Like comment"}><Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "text-rose-300" : ""} />{liked ? "Liked" : "Like"}</Button>{error && <p role="alert" className="text-xs text-rose-300">{error}</p>}</div>;
}
