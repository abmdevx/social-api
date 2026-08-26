export function Description({ text }: { text?: string }) {
  return <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">{text?.trim() || "No description provided."}</p></div>;
}
