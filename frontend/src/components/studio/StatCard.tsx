import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LucideIcon; accent: string }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5"><div className={`mb-8 flex size-10 items-center justify-center rounded-xl ${accent}`}><Icon size={19} /></div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold tracking-tight text-slate-100">{value}</p></article>;
}
