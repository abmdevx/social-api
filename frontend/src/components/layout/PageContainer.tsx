import type { ReactNode } from "react";

export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-360 px-5 py-6 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}
