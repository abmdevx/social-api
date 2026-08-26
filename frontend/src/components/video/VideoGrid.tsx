import type { Video } from "../../types/video";
import { VideoCard } from "./VideoCard";

export function VideoGrid({ videos }: { videos: Video[] }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{videos.map((video) => <VideoCard key={video._id} video={video} />)}</div>;
}
