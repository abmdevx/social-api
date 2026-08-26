import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "cyan" | "green" | "rose" }) {
  const tones = {
    neutral: "bg-slate-800 text-slate-300",
    cyan: "bg-cyan-400/10 text-cyan-300",
    green: "bg-emerald-400/10 text-emerald-300",
    rose: "bg-rose-400/10 text-rose-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
