export interface PageResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

/** Builds the pagination envelope (same field names the previous aggregatePaginate plugin produced). */
export function buildPage<T>(
  docs: T[],
  totalDocs: number,
  page: number,
  limit: number
): PageResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
}

export function skipFor(page: number, limit: number): number {
  return (page - 1) * limit;
}
