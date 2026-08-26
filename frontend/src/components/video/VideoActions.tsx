import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { LikeButton } from "../ui/LikeButton";

export function VideoActions({ videoId }: { videoId: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  return <div className="flex flex-wrap gap-2"><LikeButton targetId={videoId} target="video" /><Button variant="secondary" size="sm" onClick={() => void share()}>{copied ? <Check size={16} /> : <Share2 size={16} />}{copied ? "Copied" : "Share"}</Button></div>;
}
