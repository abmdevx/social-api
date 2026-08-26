import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
}

export function Textarea({ label, className = "", containerClassName = "", id, ...props }: TextareaProps) {
  return (
    <label className={`block space-y-2 text-sm font-medium text-slate-300 ${containerClassName}`} htmlFor={id}>
      {label && <span>{label}</span>}
      <textarea
        id={id}
        className={`min-h-28 w-full resize-y rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-cyan-400/70 ${className}`}
        {...props}
      />
    </label>
  );
}
