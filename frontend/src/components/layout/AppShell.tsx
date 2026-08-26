import type { ReactNode } from "react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { BarChart3, Clock3, Compass, History, Home, ListVideo, ThumbsUp, UserRound, UsersRound } from "lucide-react";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

export function AppShell({ children, onSearch }: { children: ReactNode; onSearch?: (query: string) => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <div className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.08),transparent_32rem)] text-slate-100">
    <TopNavbar onMenuClick={() => setMobileMenuOpen(true)} onSearch={onSearch} />
    <Sidebar />
    {mobileMenuOpen && <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden" />}
    <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 pt-20 transition-transform lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}><SidebarMobile onClose={() => setMobileMenuOpen(false)} /></div>
    <div className="pt-20 lg:pl-64">{children}</div>
    <MobileBottomNavigation />
  </div>;
}

function SidebarMobile({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const items = [
    ["Home", "/", Home], ["Explore", "/explore", Compass], ["Subscriptions", "/subscriptions", UsersRound],
    ["History", "/history", History], ["Liked Videos", "/liked", ThumbsUp], ["Playlists", "/playlists", ListVideo],
    ["Tweets", "/tweets", Clock3], ["My Channel", user ? `/channel/${user.username}` : "/profile", UserRound], ["Studio", "/studio", BarChart3],
  ] as const;
  return <nav className="space-y-1 p-3" onClick={onClose}>{items.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium ${isActive ? "bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>;
}
