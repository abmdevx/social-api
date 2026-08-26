import type { Video } from "../../types/video";
import { VideoGrid } from "./VideoGrid";

export function HistoryList({ videos }: { videos: Video[] }) {
  return <VideoGrid videos={videos} />;
}
