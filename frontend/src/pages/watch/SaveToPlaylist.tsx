import { useState } from "react";
import { ListPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  addVideoToPlaylist,
  createPlaylist,
  getPlaylists,
  removeVideoFromPlaylist,
} from "@/api/playlists";
import { ErrorState, Spinner } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

function PlaylistChoices({ videoId }: { videoId: string }) {
  const me = useCurrentUser();
  const { data, error, loading, reload, setData } = useAsync(() => getPlaylists(me._id), [me._id]);
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (playlistId: string, has: boolean) => {
    setBusyId(playlistId);
    try {
      if (has) await removeVideoFromPlaylist(playlistId, videoId);
      else await addVideoToPlaylist(playlistId, videoId);
      setData((list) =>
        list?.map((p) =>
          p._id === playlistId
            ? {
                ...p,
                videos: has ? p.videos.filter((id) => id !== videoId) : [...p.videos, videoId],
              }
            : p
        )
      );
      toast.success(has ? "Removed from playlist" : "Saved to playlist");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusyId("new");
    try {
      const created = await createPlaylist(name, "");
      await addVideoToPlaylist(created._id, videoId);
      setNewName("");
      toast.success(`Saved to “${name}”`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return loading ? <Spinner /> : null;

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have no playlists yet. Create one below.
        </p>
      ) : (
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {data.map((playlist) => {
            const has = playlist.videos.includes(videoId);
            return (
              <li key={playlist._id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent">
                  <Checkbox
                    checked={has}
                    disabled={busyId === playlist._id}
                    onCheckedChange={() => void toggle(playlist._id, has)}
                  />
                  <span className="truncate">{playlist.playlistName}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
      <form onSubmit={(event) => void create(event)} className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New playlist name"
          maxLength={100}
          aria-label="New playlist name"
        />
        <Button
          type="submit"
          size="icon"
          disabled={busyId === "new" || !newName.trim()}
          aria-label="Create playlist"
        >
          <Plus />
        </Button>
      </form>
    </div>
  );
}

export function SaveToPlaylist({ videoId }: { videoId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ListPlus /> Save
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save to playlist</DialogTitle>
          <DialogDescription>Choose where to keep this video.</DialogDescription>
        </DialogHeader>
        <PlaylistChoices videoId={videoId} />
      </DialogContent>
    </Dialog>
  );
}
