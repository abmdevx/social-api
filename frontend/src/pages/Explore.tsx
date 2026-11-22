import { VideoFeed } from "./VideoFeed";

export default function Explore() {
  return (
    <VideoFeed
      title="Trending"
      description="The most watched videos right now."
      defaultSort="popular"
    />
  );
}
