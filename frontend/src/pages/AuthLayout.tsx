import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow: string }) {
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_34rem)] px-4 py-12 text-slate-100"><div className="w-full max-w-md"><Link to="/" className="mb-10 flex items-center justify-center gap-2.5 text-lg font-semibold"><span className="flex size-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950"><Radio size={19} /></span>Streamline</Link><div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-black/20 sm:p-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>{children}</div></div></main>;
}
