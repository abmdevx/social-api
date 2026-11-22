import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { getErrorMessage } from "@/lib/errors";

export interface AsyncState<T> {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  /** Re-run the loader (keeps current data visible while loading). */
  reload: () => void;
  /** Replace data locally, e.g. after an optimistic update. */
  setData: (updater: T | undefined | ((current: T | undefined) => T | undefined)) => void;
}

/**
 * Runs `loader` on mount and whenever `deps` change. Out-of-order responses are discarded, so a
 * slow earlier request can never overwrite a newer one.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let current = true;
    // Resetting request state when the inputs change is exactly what this hook is for.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    loaderRef
      .current()
      .then((result) => {
        if (current) setData(result);
      })
      .catch((err: unknown) => {
        if (current) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, loading, reload, setData };
}
