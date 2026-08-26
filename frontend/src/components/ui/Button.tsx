import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const variants = {
  primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  secondary: "border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800",
  ghost: "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
  danger: "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "size-10",
};

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const statusClass = children === "Unpublish"
    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
    : children === "Publish"
      ? "border border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20"
      : "";

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${statusClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
