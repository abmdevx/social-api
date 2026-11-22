import { VideoFeed } from "./VideoFeed";

export default function Home() {
  return (
    <VideoFeed
      title="Home"
      description="Fresh videos from across Streamline."
      defaultSort="newest"
    />
  );
}
