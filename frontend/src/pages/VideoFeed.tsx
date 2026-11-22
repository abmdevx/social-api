import { useSearchParams } from "react-router-dom";
import { SearchX, Video as VideoIcon } from "lucide-react";
import { getVideos } from "@/api/videos";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState, ErrorState, PageHeader, VideoGridSkeleton } from "@/components/common/states";
import { VideoGrid } from "@/components/common/VideoCard";
import { useAsync } from "@/hooks/useAsync";
import type { SortDirection, VideoSortBy } from "@/types/models";

const PAGE_SIZE = 12;

const SORTS: { value: string; label: string; sortBy: VideoSortBy; sortType: SortDirection }[] = [
  { value: "newest", label: "Newest", sortBy: "createdAt", sortType: "desc" },
  { value: "oldest", label: "Oldest", sortBy: "createdAt", sortType: "asc" },
  { value: "popular", label: "Most viewed", sortBy: "views", sortType: "desc" },
  { value: "longest", label: "Longest", sortBy: "duration", sortType: "desc" },
];

/** Paged, searchable, sortable list of published videos. State lives in the URL (shareable, back-button friendly). */
export function VideoFeed({
  title,
  description,
  defaultSort,
}: {
  title: string;
  description: string;
  defaultSort: string;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const sortKey = SORTS.some((s) => s.value === params.get("sort"))
    ? (params.get("sort") as string)
    : defaultSort;
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const sort = SORTS.find((s) => s.value === sortKey) ?? SORTS[0]!;

  const { data, error, loading, reload } = useAsync(
    () =>
      getVideos({
        page,
        limit: PAGE_SIZE,
        ...(query ? { query } : {}),
        sortBy: sort.sortBy,
        sortType: sort.sortType,
      }),
    [page, query, sort.sortBy, sort.sortType]
  );

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  };

  return (
    <div>
      <PageHeader
        title={query ? `Results for “${query}”` : title}
        description={query ? undefined : description}
        actions={
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Sort by
            <select
              value={sortKey}
              onChange={(event) => update({ sort: event.target.value, page: null })}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data && loading ? (
        <VideoGridSkeleton />
      ) : data && data.docs.length === 0 ? (
        query ? (
          <EmptyState
            icon={SearchX}
            title="No videos found"
            description={`Nothing matched “${query}”. Try different keywords.`}
          />
        ) : (
          <EmptyState
            icon={VideoIcon}
            title="No videos yet"
            description="Be the first to upload something."
          />
        )
      ) : data ? (
        <div className={loading ? "opacity-60 transition-opacity" : undefined} aria-busy={loading}>
          <VideoGrid videos={data.docs} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(next) => update({ page: next === 1 ? null : String(next) })}
          />
        </div>
      ) : null}
    </div>
  );
}
