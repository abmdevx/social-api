import { Heart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleTweetLike } from "../../api/tweets";
import { toggleVideoLike } from "../../api/watch";
import { useAuth } from "../../context/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { Button } from "./Button";

export function LikeButton({ targetId, target, initialLiked = false, onChanged }: { targetId: string; target: "video" | "tweet"; initialLiked?: boolean; onChanged?: (liked: boolean) => void }) {
  const { user } = useAuth(); const navigate = useNavigate(); const [liked, setLiked] = useState(initialLiked); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const toggle = async () => { if (!user) { navigate("/login"); return; } setLoading(true); setError(""); try { const value = target === "video" ? await toggleVideoLike(targetId) : await toggleTweetLike(targetId); setLiked(value); onChanged?.(value); } catch (requestError) { setError(getApiErrorMessage(requestError, "Like could not be updated.")); } finally { setLoading(false); } };
  return <div><Button variant={liked ? "primary" : "secondary"} size="sm" onClick={() => void toggle()} disabled={loading} aria-label={liked ? "Unlike" : "Like"}><Heart size={16} fill={liked ? "currentColor" : "none"} />{loading ? "Updating..." : liked ? "Liked" : "Like"}</Button>{error && <p role="alert" className="mt-1 text-xs text-rose-300">{error}</p>}</div>;
}
