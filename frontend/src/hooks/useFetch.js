// hooks/useFetch.js — Generic data-fetching hook with loading/error states
import { useState, useEffect, useCallback } from "react";

/**
 * Generic fetch hook. Calls the provided async `fetcher` function.
 * 
 * @param {Function} fetcher - Async function that returns data
 * @param {Array} deps - Dependency array (like useEffect)
 * 
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(() => getDoctorsApi(), []);
 */
const useFetch = (fetcher, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result?.data ?? result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
