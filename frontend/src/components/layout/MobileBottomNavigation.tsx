import { NavLink } from "react-router-dom";
import { Compass, Home, Library, UserRound } from "lucide-react";

const items = [
  { label: "Home", to: "/", icon: Home },
  { label: "Explore", to: "/explore", icon: Compass },
  { label: "Library", to: "/playlists", icon: Library },
  { label: "Channel", to: "/channel", icon: UserRound },
];

export function MobileBottomNavigation() {
  return <nav className="fixed inset-x-0 bottom-0 z-40 grid h-18 grid-cols-4 border-t border-slate-800/80 bg-slate-950/95 px-2 pb-1 backdrop-blur-xl lg:hidden">{items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${isActive ? "text-cyan-300" : "text-slate-500"}`}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>;
}
