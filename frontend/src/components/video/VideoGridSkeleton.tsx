import { Skeleton } from "../ui/Skeleton";

export function VideoSkeleton() {
  return <div><Skeleton className="aspect-video rounded-2xl" /><div className="mt-3 flex gap-3"><Skeleton className="size-8 shrink-0 rounded-full" /><div className="w-full space-y-2"><Skeleton className="h-4 w-11/12" /><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div></div>;
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: count }, (_, index) => <VideoSkeleton key={index} />)}</div>;
}
