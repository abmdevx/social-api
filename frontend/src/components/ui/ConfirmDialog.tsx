import { Modal } from "./Modal";
import { Button } from "./Button";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onConfirm, onClose }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
