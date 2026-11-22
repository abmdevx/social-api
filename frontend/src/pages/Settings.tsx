import { useRef, useState, type FormEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword, updateAccount, updateAvatar, updateCoverImage } from "@/api/users";
import { PageHeader } from "@/components/common/states";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { validateImage } from "@/lib/files";

function ImagesCard() {
  const user = useCurrentUser();
  const { refreshUser } = useAuth();
  const [busy, setBusy] = useState<"avatar" | "cover" | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const upload =
    (kind: "avatar" | "cover") => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      const problem = validateImage(file);
      if (problem) {
        toast.error(problem);
        return;
      }
      setBusy(kind);
      try {
        await (kind === "avatar" ? updateAvatar(file) : updateCoverImage(file));
        await refreshUser();
        toast.success(kind === "avatar" ? "Avatar updated" : "Cover image updated");
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setBusy(null);
      }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile images</CardTitle>
        <CardDescription>JPEG, PNG, WebP or GIF up to 5 MB.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-br from-primary/30 to-primary/5">
          {user.coverImage?.url && (
            <img src={user.coverImage.url} alt="Cover" className="size-full object-cover" />
          )}
          <input
            ref={coverRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void upload("cover")(e)}
          />
          <Button
            size="sm"
            variant="secondary"
            className="absolute right-2 bottom-2"
            disabled={busy !== null}
            onClick={() => coverRef.current?.click()}
          >
            {busy === "cover" ? <Loader2 className="animate-spin" /> : <Camera />} Change cover
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="size-16" />
          <input
            ref={avatarRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void upload("avatar")(e)}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => avatarRef.current?.click()}
          >
            {busy === "avatar" ? <Loader2 className="animate-spin" /> : <Camera />} Change avatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountCard() {
  const user = useCurrentUser();
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [busy, setBusy] = useState(false);
  const dirty = fullName.trim() !== user.fullName || email.trim().toLowerCase() !== user.email;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await updateAccount(fullName.trim(), email.trim());
      await refreshUser();
      toast.success("Account updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account details</CardTitle>
        <CardDescription>Signed in as @{user.username}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="st-name">Full name</Label>
            <Input
              id="st-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="st-email">Email</Label>
            <Input
              id="st-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-fit" disabled={busy || !dirty}>
            {busy && <Loader2 className="animate-spin" />} Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== newPassword;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mismatch) return;
    setBusy(true);
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Use at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="pw-old">Current password</Label>
            <Input
              id="pw-old"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw-new">New password</Label>
            <Input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={mismatch}
              required
            />
            {mismatch && <p className="text-xs text-destructive">Passwords do not match.</p>}
          </div>
          <Button
            type="submit"
            className="w-fit"
            disabled={busy || mismatch || !oldPassword || newPassword.length < 8}
          >
            {busy && <Loader2 className="animate-spin" />} Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and security." />
      <ImagesCard />
      <AccountCard />
      <PasswordCard />
    </div>
  );
}
