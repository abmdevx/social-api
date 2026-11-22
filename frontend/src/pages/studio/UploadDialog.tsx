import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadVideo } from "@/api/studio";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { formatBytes, validateImage, validateVideo } from "@/lib/files";

function UploadForm({ onDone }: { onDone: () => void }) {
  const [video, setVideo] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick =
    (validate: (file: File) => string | null, setter: (file: File | null) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      const problem = file ? validate(file) : null;
      if (problem) {
        setError(problem);
        event.target.value = "";
        setter(null);
        return;
      }
      setError(null);
      setter(file);
      if (file && setter === setVideo && !title)
        setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 100));
    };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!video) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      await uploadVideo(
        {
          video,
          title: title.trim(),
          description: description.trim(),
          ...(thumbnail ? { thumbnail } : {}),
        },
        setProgress
      );
      toast.success("Video uploaded");
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Upload video</DialogTitle>
        <DialogDescription>
          Videos are published immediately. You can unpublish them later from Studio.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="up-video">Video file</Label>
        <Input
          id="up-video"
          type="file"
          accept="video/*"
          required
          disabled={busy}
          onChange={pick(validateVideo, setVideo)}
        />
        {video && (
          <p className="text-xs text-muted-foreground">
            {video.name} · {formatBytes(video.size)}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="up-thumb">Thumbnail (optional)</Label>
        <Input
          id="up-thumb"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={busy}
          onChange={pick(validateImage, setThumbnail)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="up-title">Title</Label>
        <Input
          id="up-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          disabled={busy}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="up-desc">Description (optional)</Label>
        <Textarea
          id="up-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={4}
          disabled={busy}
        />
      </div>
      {busy && (
        <div className="space-y-1" aria-live="polite">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            {progress < 100 ? `Uploading… ${progress}%` : "Processing…"}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button type="submit" disabled={busy || !video || !title.trim()}>
          {busy && <Loader2 className="animate-spin" />} Upload
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        {open && (
          <UploadForm
            onDone={() => {
              onOpenChange(false);
              onUploaded();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
