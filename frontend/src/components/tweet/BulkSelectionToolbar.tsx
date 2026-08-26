import { Trash2, X } from "lucide-react";
import { Button } from "../ui/Button";

export function BulkSelectionToolbar({ count, onDelete, onClear }: { count: number; onDelete: () => void; onClear: () => void }) {
  if (!count) return null;
  return <div className="sticky bottom-20 z-10 flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-slate-900/95 p-3 shadow-xl shadow-black/20 backdrop-blur lg:bottom-4"><span className="text-sm text-slate-300">{count} tweet{count === 1 ? "" : "s"} selected</span><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={onClear}><X size={15} />Clear</Button><Button size="sm" variant="danger" onClick={onDelete}><Trash2 size={15} />Delete selected</Button></div></div>;
}
