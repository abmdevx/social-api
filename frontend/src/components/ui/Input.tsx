import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", id, ...props }: InputProps) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-300" htmlFor={id}>
      {label && <span>{label}</span>}
      <input
        id={id}
        className={`h-11 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 transition-colors focus:border-cyan-400/70 ${className}`}
        {...props}
      />
    </label>
  );
}
