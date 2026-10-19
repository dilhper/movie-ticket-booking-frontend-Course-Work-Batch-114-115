import { useCallback, useEffect, useRef, useState, type Dispatch, type DependencyList, type SetStateAction } from 'react';
import { getErrorMessage } from '../utils/apiError';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * Runs an async loader on mount / when `deps` change and tracks loading + error state.
 * Stale responses from superseded requests are ignored.
 */
export function useFetch<T>(loader: () => Promise<T>, deps: DependencyList = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state when a new request starts
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, reload, setData };
}
