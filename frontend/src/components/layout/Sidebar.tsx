import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Clock3,
  Compass,
  Film,
  History,
  Home,
  ListVideo,
  PanelLeftClose,
  PanelLeftOpen,
  ThumbsUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/useAuth";

interface NavItem { label: string; to: string; icon: LucideIcon }

const primary: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Subscriptions", to: "/subscriptions", icon: UsersRound },
];

const library: NavItem[] = [
  { label: "History", to: "/history", icon: History },
  { label: "Liked Videos", to: "/liked", icon: ThumbsUp },
  { label: "Playlists", to: "/playlists", icon: ListVideo },
  { label: "Tweets", to: "/tweets", icon: Clock3 },
];

const workspaceItems = (username?: string): NavItem[] => [
  { label: "My Channel", to: username ? `/channel/${username}` : "/profile", icon: UserRound },
  { label: "Studio", to: "/studio", icon: BarChart3 },
];

function NavSection({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return <nav className="space-y-1">{items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} title={collapsed ? label : undefined} className={({ isActive }) => `group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"} ${collapsed ? "justify-center" : ""}`}><Icon size={19} strokeWidth={1.8} /><span className={collapsed ? "sr-only" : ""}>{label}</span></NavLink>)}</nav>;
}

export function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  return <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-800/80 bg-slate-950/95 pt-20 transition-[width] duration-200 lg:block ${collapsed ? "w-19" : "w-64"}`}>
    <div className="flex h-full flex-col px-3 py-5">
      <div className="mb-5 flex justify-end"><Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</Button></div>
      <NavSection items={primary} collapsed={collapsed} />
      <div className="my-5 border-t border-slate-800/80" />
      {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Your library</p>}
      <NavSection items={library} collapsed={collapsed} />
      <div className="my-5 border-t border-slate-800/80" />
      {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Workspace</p>}
      <NavSection items={workspaceItems(user?.username)} collapsed={collapsed} />
      <div className={`mt-auto rounded-xl border border-slate-800 bg-slate-900/50 p-3 ${collapsed ? "hidden" : ""}`}><div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300"><Film size={15} className="text-cyan-400" />Creator tools</div><p className="text-xs leading-5 text-slate-500">Your publishing workspace is ready when you are.</p></div>
    </div>
  </aside>;
}
