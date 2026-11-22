import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ListX, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deletePlaylist,
  getPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "@/api/playlists";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState, PageHeader, PageSpinner } from "@/components/common/states";
import { VideoGrid } from "@/components/common/VideoCard";
import { Button } from "@/components/ui/button";
import { useAsync } from "@/hooks/useAsync";
import { useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { plural } from "@/lib/format";
import { PlaylistFormDialog } from "./PlaylistForm";

export default function PlaylistDetail() {
  const { playlistId = "" } = useParams();
  const me = useCurrentUser();
  const navigate = useNavigate();
  const { data, error, loading, reload, setData } = useAsync(
    () => getPlaylist(playlistId),
    [playlistId]
  );
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (error) {
    return /not found/i.test(error) ? (
      <EmptyState
        icon={ListX}
        title="Playlist not found"
        action={
          <Button asChild variant="outline">
            <Link to="/playlists">All playlists</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState message={error} onRetry={reload} />
    );
  }
  if (!data) return loading ? <PageSpinner /> : null;

  const isOwner = data.owner === me._id;
  const videoCount = `${data.videos.length} ${plural(data.videos.length, "video")}`;
  const description = data.playlistDescription
    ? `${data.playlistDescription} · ${videoCount}`
    : videoCount;

  const save = async (name: string, description: string) => {
    const updated = await updatePlaylist(data._id, name, description);
    setData(updated);
    toast.success("Playlist updated");
  };

  const remove = async () => {
    try {
      await deletePlaylist(data._id);
      toast.success("Playlist deleted");
      void navigate("/playlists", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      setData(await removeVideoFromPlaylist(data._id, videoId));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={data.playlistName}
        description={description}
        actions={
          isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil /> Edit
              </Button>
              <Button variant="outline" onClick={() => setDeleting(true)}>
                <Trash2 /> Delete
              </Button>
            </div>
          )
        }
      />
      {data.videos.length === 0 ? (
        <EmptyState
          icon={ListX}
          title="This playlist is empty"
          description={isOwner ? "Use “Save” on a video's page to add it here." : undefined}
        />
      ) : (
        <VideoGrid
          videos={data.videos}
          renderAction={
            isOwner
              ? (video) => (
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => void removeVideo(video._id)}
                    aria-label={`Remove ${video.title} from playlist`}
                  >
                    <X />
                  </Button>
                )
              : undefined
          }
        />
      )}
      <PlaylistFormDialog
        open={editing}
        onOpenChange={setEditing}
        title="Edit playlist"
        submitLabel="Save"
        initial={{ name: data.playlistName, description: data.playlistDescription ?? "" }}
        onSubmit={save}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete playlist?"
        description="The videos themselves are not deleted."
        onConfirm={remove}
      />
    </div>
  );
}
