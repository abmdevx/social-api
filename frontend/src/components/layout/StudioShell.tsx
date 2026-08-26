import type { ReactNode } from "react";
import { BarChart3, Clapperboard, LayoutDashboard, UploadCloud } from "lucide-react";
import { NavLink } from "react-router-dom";
import { AppShell } from "./AppShell";

export function StudioShell({ children }: { children: ReactNode }) {
  const links = [["Overview", "/studio", LayoutDashboard], ["Videos", "/studio/videos", Clapperboard], ["Upload", "/studio/upload", UploadCloud]] as const;
  return <AppShell><div className="min-h-[calc(100vh-5rem)] bg-slate-900/20"><div className="border-b border-slate-800/80 bg-slate-950/40"><div className="mx-auto flex max-w-360 flex-col gap-4 px-5 py-6 sm:px-8 lg:px-10 md:flex-row md:items-center md:justify-between"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300"><BarChart3 size={15} />Creator studio</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-100">Build your channel.</h1></div><nav className="flex gap-1 overflow-x-auto">{links.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === "/studio"} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-amber-300 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}`}><Icon size={16} />{label}</NavLink>)}</nav></div></div><div className="mx-auto max-w-360 px-5 py-8 sm:px-8 lg:px-10">{children}</div></div></AppShell>;
}
