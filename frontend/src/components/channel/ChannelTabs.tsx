import { NavLink } from "react-router-dom";

export function ChannelTabs({ username }: { username: string }) {
  const tabs = [["Videos", `/channel/${username}`], ["Tweets", `/channel/${username}/tweets`], ["Playlists", `/channel/${username}/playlists`]];
  return <nav className="flex gap-6 overflow-x-auto border-b border-slate-800" aria-label="Channel sections">{tabs.map(([label, to]) => <NavLink key={to} to={to} end={label === "Videos"} className={({ isActive }) => `relative whitespace-nowrap py-4 text-sm font-medium transition-colors ${isActive ? "text-cyan-300 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-cyan-400" : "text-slate-500 hover:text-slate-200"}`}>{label}</NavLink>)}</nav>;
}
