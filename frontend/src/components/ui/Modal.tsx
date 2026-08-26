import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/30">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
