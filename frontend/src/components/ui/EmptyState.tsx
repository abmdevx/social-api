import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center">
      {icon && <div className="mb-4 text-slate-600">{icon}</div>}
      <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
