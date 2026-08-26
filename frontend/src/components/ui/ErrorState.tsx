import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorState({ title = "Something went wrong", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 text-center">
      <CircleAlert className="mb-4 text-rose-300" size={28} />
      <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
