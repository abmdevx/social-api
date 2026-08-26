import { useState } from "react";
import { Button } from "../ui/Button";
import { toggleSubscription } from "../../api/watch";
import { getApiErrorMessage } from "../../utils/apiError";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export function SubscribeButton({ channelId, subscribed, onChange }: { channelId: string; subscribed: boolean; onChange: (value: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth(); const navigate = useNavigate();
  const toggle = async () => { if (!user) { navigate("/login"); return; } setLoading(true); setError(""); try { onChange(await toggleSubscription(channelId)); } catch (requestError) { setError(getApiErrorMessage(requestError, "Subscription could not be updated.")); } finally { setLoading(false); } };
  return <div><Button variant={subscribed ? "secondary" : "primary"} size="sm" onClick={() => void toggle()} disabled={loading}>{loading ? "Updating..." : subscribed ? "Subscribed" : "Subscribe"}</Button>{error && <p className="mt-1 text-xs text-rose-300">{error}</p>}</div>;
}
