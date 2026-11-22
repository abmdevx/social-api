import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, Pencil, Plus, ThumbsUp, Trash2, Users, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import {
  deleteStudioVideo,
  getStudioStats,
  getStudioVideos,
  setStudioPublished,
} from "@/api/studio";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState, PageHeader, PageSpinner } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAsync } from "@/hooks/useAsync";
import { getErrorMessage } from "@/lib/errors";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import type { StudioVideo } from "@/types/models";
import { EditVideoDialog } from "./studio/EditVideoDialog";
import { UploadDialog } from "./studio/UploadDialog";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | undefined;
  icon: typeof Eye;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value === undefined ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums">{formatCount(value)}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Studio() {
  const [params, setParams] = useSearchParams();
  const uploadOpen = params.get("upload") === "1";
  const stats = useAsync(getStudioStats, []);
  const videos = useAsync(getStudioVideos, []);
  const [editing, setEditing] = useState<StudioVideo | null>(null);
  const [deleting, setDeleting] = useState<StudioVideo | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const setUpload = (open: boolean) => {
    const next = new URLSearchParams(params);
    if (open) next.set("upload", "1");
    else next.delete("upload");
    setParams(next, { replace: true });
  };

  const patchVideo = (next: StudioVideo) =>
    videos.setData((list) => list?.map((v) => (v._id === next._id ? { ...v, ...next } : v)));

  const togglePublish = async (video: StudioVideo) => {
    setPendingId(video._id);
    try {
      const updated = await setStudioPublished(video._id, !video.isPublished);
      patchVideo({ ...video, isPublished: updated.isPublished });
      toast.success(updated.isPublished ? "Video published" : "Video unpublished");
      stats.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await deleteStudioVideo(deleting._id);
      toast.success("Video deleted");
      setDeleting(null);
      videos.reload();
      stats.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const uploadButton = (
    <Button onClick={() => setUpload(true)}>
      <Plus /> Upload video
    </Button>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Studio"
        description="Manage your videos and see how they're doing."
        actions={uploadButton}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Videos" value={stats.data?.stats.totalVideos} icon={VideoIcon} />
        <StatCard label="Total views" value={stats.data?.stats.totalViews} icon={Eye} />
        <StatCard label="Subscribers" value={stats.data?.totalSubscribers} icon={Users} />
        <StatCard label="Total likes" value={stats.data?.likesData.totalLikes} icon={ThumbsUp} />
      </div>
      {stats.error && <ErrorState message={stats.error} onRetry={stats.reload} />}

      <h2 className="mb-3 text-lg font-semibold">Your videos</h2>
      {videos.error ? (
        <ErrorState message={videos.error} onRetry={videos.reload} />
      ) : !videos.data ? (
        videos.loading && <PageSpinner />
      ) : videos.data.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No videos yet"
          description="Upload your first video to get started."
          action={uploadButton}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {videos.data.map((video) => (
                <tr key={video._id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                        {video.thumbnail?.url && (
                          <img
                            src={video.thumbnail.url}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        )}
                        {video.duration ? (
                          <span className="absolute right-1 bottom-1 rounded bg-black/75 px-1 text-[10px] text-white tabular-nums">
                            {formatDuration(video.duration)}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        to={`/watch/${video._id}`}
                        className="line-clamp-2 font-medium hover:underline"
                      >
                        {video.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={video.isPublished}
                        disabled={pendingId === video._id}
                        onCheckedChange={() => void togglePublish(video)}
                        aria-label={`${video.isPublished ? "Unpublish" : "Publish"} ${video.title}`}
                      />
                      <Badge variant={video.isPublished ? "success" : "secondary"}>
                        {video.isPublished ? "Published" : "Private"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCount(video.views)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(video.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(video)}
                        aria-label={`Edit ${video.title}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleting(video)}
                        aria-label={`Delete ${video.title}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUpload}
        onUploaded={() => {
          videos.reload();
          stats.reload();
        }}
      />
      <EditVideoDialog
        video={editing}
        onClose={() => setEditing(null)}
        onSaved={(next) => {
          patchVideo(next);
          setEditing((cur) => (cur ? { ...cur, ...next } : cur));
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete video?"
        description={
          deleting
            ? `“${deleting.title}” and its comments and likes will be permanently removed.`
            : ""
        }
        onConfirm={remove}
      />
    </div>
  );
}
