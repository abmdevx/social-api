export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} aria-hidden="true" />;
}
