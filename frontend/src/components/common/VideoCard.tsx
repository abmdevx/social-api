import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatCount, formatDuration, plural, timeAgo } from "@/lib/format";
import type { Video } from "@/types/models";

export function VideoCard({ video, action }: { video: Video; action?: React.ReactNode }) {
  return (
    <article className="group relative">
      <Link
        to={`/watch/${video._id}`}
        className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          {video.thumbnail?.url ? (
            <img
              src={video.thumbnail.url}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Play className="size-8" />
            </div>
          )}
          {video.duration ? (
            <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 pr-8 text-sm leading-snug font-semibold">{video.title}</h3>
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <Link to={`/c/${video.owner.username}`} className="shrink-0">
          <UserAvatar user={video.owner} className="size-7" />
        </Link>
        <div className="min-w-0 text-xs text-muted-foreground">
          <Link to={`/c/${video.owner.username}`} className="block truncate hover:text-foreground">
            {video.owner.fullName}
          </Link>
          <span>
            {formatCount(video.views)} {plural(video.views, "view")} · {timeAgo(video.createdAt)}
          </span>
        </div>
      </div>
      {action && <div className="absolute top-[calc(100%-3.5rem)] right-0">{action}</div>}
    </article>
  );
}

export function VideoGrid({
  videos,
  renderAction,
}: {
  videos: Video[];
  renderAction?: (video: Video) => React.ReactNode;
}) {
  return (
    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} action={renderAction?.(video)} />
      ))}
    </div>
  );
}
