import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/setup";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) return setError("Enter your username or email and password.");
    setError("");
    setIsSubmitting(true);
    try { await login({ identifier: identifier.trim(), password }); navigate(from, { replace: true }); }
    catch (submitError) { setError(getApiErrorMessage(submitError, "Unable to sign in with those details.")); }
    finally { setIsSubmitting(false); }
  };

  return <AuthLayout eyebrow="Welcome back" title="Sign in to Streamline"><form onSubmit={handleSubmit} className="mt-8 space-y-5"><Input id="identifier" label="Username or email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" placeholder="you@example.com" required /><Input id="password" label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Your password" required />{error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-sm text-rose-300">{error}</p>}<Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">New to Streamline? <Link to="/register" className="font-medium text-cyan-300 hover:text-cyan-200">Create an account</Link></p></AuthLayout>;
}
