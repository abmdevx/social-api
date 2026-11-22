import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { validateImage } from "@/lib/files";
import { AuthShell } from "./AuthShell";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({ fullName: "", username: "", email: "", password: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof fields) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const pickImage =
    (setter: (file: File | null) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      const problem = file ? validateImage(file) : null;
      if (problem) {
        setError(problem);
        event.target.value = "";
        setter(null);
        return;
      }
      setError(null);
      setter(file);
    };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!avatar) {
      setError("Please choose an avatar image.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        ...fields,
        username: fields.username.trim().toLowerCase(),
        email: fields.email.trim(),
        fullName: fields.fullName.trim(),
        avatar,
        ...(coverImage ? { coverImage } : {}),
      });
      toast.success("Account created. Please sign in.");
      void navigate("/login", { replace: true });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Join Streamline to upload videos and follow channels."
    >
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={fields.fullName}
            onChange={set("fullName")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              required
              pattern="[a-zA-Z0-9_.\-]{3,30}"
              title="3-30 characters: letters, numbers, underscore, dot or hyphen"
              value={fields.username}
              onChange={set("username")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={fields.email}
              onChange={set("email")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={fields.password}
            onChange={set("password")}
          />
          <p className="text-xs text-muted-foreground">8 to 72 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar">Avatar (required)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
            onChange={pickImage(setAvatar)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">Cover image (optional)</Label>
          <Input
            id="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={pickImage(setCoverImage)}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />} Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
