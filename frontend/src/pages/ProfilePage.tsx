import { Link } from "react-router-dom";
import { CalendarDays, Settings2 } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { PageContainer } from "../components/layout/PageContainer";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const joined = user.createdAt ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(user.createdAt)) : "Date unavailable";
  return <AppShell><PageContainer><div className="mx-auto max-w-4xl space-y-6"><div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"><div className="h-44 bg-slate-800 sm:h-60">{user.coverImage?.url && <img src={user.coverImage.url} alt="" className="size-full object-cover" />}</div><div className="px-5 pb-7 sm:px-8"><div className="-mt-12 sm:-mt-14"><Avatar name={user.fullName} src={user.avatar?.url} size="lg" className="ring-4 ring-slate-950 sm:size-24" /></div><div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-slate-100">{user.fullName}</h1><p className="mt-1 text-sm text-slate-500">@{user.username}</p><p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={15} />Member since {joined}</p></div><Link to="/settings"><Button variant="secondary"><Settings2 size={16} />Edit profile</Button></Link></div></div></div><section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Account details</p><dl className="mt-5 grid gap-5 sm:grid-cols-2"><div><dt className="text-xs text-slate-600">Full name</dt><dd className="mt-1 text-sm text-slate-200">{user.fullName}</dd></div><div><dt className="text-xs text-slate-600">Username</dt><dd className="mt-1 text-sm text-slate-200">@{user.username}</dd></div><div><dt className="text-xs text-slate-600">Email</dt><dd className="mt-1 text-sm text-slate-200">{user.email}</dd></div></dl></section></div></PageContainer></AppShell>;
}
