import { useState } from "react";
import { ListVideo, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPlaylist, getPlaylists } from "@/api/playlists";
import { PlaylistCard } from "@/components/common/PlaylistCard";
import { EmptyState, ErrorState, PageHeader, PageSpinner } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { PlaylistFormDialog } from "./PlaylistForm";

export default function Playlists() {
  const me = useCurrentUser();
  const { data, error, loading, reload } = useAsync(() => getPlaylists(me._id), [me._id]);
  const [creating, setCreating] = useState(false);

  const create = async (name: string, description: string) => {
    await createPlaylist(name, description);
    toast.success("Playlist created");
    reload();
  };

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus /> New playlist
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Playlists"
        description="Collections of videos you've curated."
        actions={newButton}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        loading && <PageSpinner />
      ) : data.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="No playlists yet"
          description="Create one, then save videos to it from the watch page."
          action={newButton}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((playlist) => (
            <PlaylistCard key={playlist._id} playlist={playlist} />
          ))}
        </div>
      )}
      <PlaylistFormDialog
        open={creating}
        onOpenChange={setCreating}
        title="New playlist"
        submitLabel="Create"
        onSubmit={create}
      />
    </div>
  );
}
