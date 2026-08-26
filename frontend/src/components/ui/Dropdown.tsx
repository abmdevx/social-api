import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden">{label}<ChevronDown size={15} /></summary>
      <div className="absolute right-0 top-full z-30 mt-2 min-w-48 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-xl shadow-black/30">{children}</div>
    </details>
  );
}

export function DropdownItem({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100">{children}</button>;
}
