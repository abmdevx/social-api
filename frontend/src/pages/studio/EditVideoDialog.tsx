import { useRef, useState, type FormEvent } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateStudioThumbnail, updateStudioVideo } from "@/api/studio";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { validateImage } from "@/lib/files";
import type { StudioVideo } from "@/types/models";

function EditForm({
  video,
  onSaved,
  onClose,
}: {
  video: StudioVideo;
  onSaved: (video: StudioVideo) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description ?? "");
  const [thumb, setThumb] = useState(video.thumbnail?.url);
  const [busy, setBusy] = useState(false);
  const [thumbBusy, setThumbBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const changeThumbnail = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setThumbBusy(true);
    setError(null);
    try {
      const updated = await updateStudioThumbnail(video._id, file);
      setThumb(updated.thumbnail?.url);
      onSaved({ ...video, thumbnail: updated.thumbnail });
      toast.success("Thumbnail updated");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setThumbBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await updateStudioVideo(video._id, title.trim(), description.trim());
      onSaved({
        ...video,
        title: updated.title,
        description: updated.description,
        thumbnail: updated.thumbnail ?? video.thumbnail,
      });
      toast.success("Video updated");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Edit video</DialogTitle>
        <DialogDescription>Update the details viewers see.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label>Thumbnail</Label>
        <div className="flex items-center gap-3">
          <div className="aspect-video w-40 overflow-hidden rounded-md bg-muted">
            {thumb && <img src={thumb} alt="" className="size-full object-cover" />}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void changeThumbnail(e)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={thumbBusy}
            onClick={() => fileRef.current?.click()}
          >
            {thumbBusy ? <Loader2 className="animate-spin" /> : <ImageUp />} Change
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ed-title">Title</Label>
        <Input
          id="ed-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ed-desc">Description</Label>
        <Textarea
          id="ed-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={5}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="submit" disabled={busy || !title.trim()}>
          {busy && <Loader2 className="animate-spin" />} Save changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditVideoDialog({
  video,
  onClose,
  onSaved,
}: {
  video: StudioVideo | null;
  onClose: () => void;
  onSaved: (video: StudioVideo) => void;
}) {
  return (
    <Dialog open={video !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {video && <EditForm key={video._id} video={video} onSaved={onSaved} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
