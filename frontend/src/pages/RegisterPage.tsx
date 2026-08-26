import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../utils/apiError";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", fullName: "", password: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim()) || !avatar) return setError("Complete all required fields and choose an avatar.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setError(""); setSuccess(""); setIsSubmitting(true);
    try { const message = await register({ ...form, avatar, coverImage: coverImage || undefined }); setSuccess(message || "Account created successfully. Redirecting to sign in..."); setTimeout(() => navigate("/login"), 900); }
    catch (submitError) { setError(getApiErrorMessage(submitError, "Unable to create your account.")); }
    finally { setIsSubmitting(false); }
  };

  return <AuthLayout eyebrow="Join the network" title="Create your account"><form onSubmit={handleSubmit} className="mt-8 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input id="fullName" label="Full name" value={form.fullName} onChange={update("fullName")} autoComplete="name" required /><Input id="username" label="Username" value={form.username} onChange={update("username")} autoComplete="username" required /></div><Input id="email" label="Email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required /><Input id="register-password" label="Password" type="password" value={form.password} onChange={update("password")} autoComplete="new-password" minLength={8} required /><FileInput id="avatar" label="Avatar" required onChange={(event) => setAvatar(event.target.files?.[0] || null)} /><FileInput id="coverImage" label="Cover image (optional)" onChange={(event) => setCoverImage(event.target.files?.[0] || null)} />{error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-sm text-rose-300">{error}</p>}{success && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-sm text-emerald-300">{success}</p>}<Button type="submit" variant="primary" size="lg" className="mt-2 w-full" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Sign in</Link></p></AuthLayout>;
}

function FileInput({ id, label, required, onChange }: { id: string; label: string; required?: boolean; onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return <label htmlFor={id} className="block space-y-2 text-sm font-medium text-slate-300"><span>{label}</span><input id={id} type="file" accept="image/*" required={required} onChange={onChange} className="block w-full rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-3 py-2.5 text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-200" /></label>;
}
