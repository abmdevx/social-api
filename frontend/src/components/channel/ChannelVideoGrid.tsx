import type { Video } from "../../types/video";
import { VideoGrid } from "../video/VideoGrid";

export function ChannelVideoGrid({ videos }: { videos: Video[] }) {
  return <VideoGrid videos={videos} />;
}
