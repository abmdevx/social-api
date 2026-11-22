import { Link } from "react-router-dom";
import { ListVideo } from "lucide-react";
import { plural } from "@/lib/format";
import type { PlaylistSummary } from "@/types/models";

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  return (
    <Link
      to={`/playlists/${playlist._id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors outline-none hover:bg-accent/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ListVideo className="size-5" />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{playlist.playlistName}</h3>
        <p className="mt-0.5 line-clamp-2 min-h-8 text-sm text-muted-foreground">
          {playlist.playlistDescription || "No description"}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {playlist.videos.length} {plural(playlist.videos.length, "video")}
      </p>
    </Link>
  );
}
