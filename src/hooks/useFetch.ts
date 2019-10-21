import { useState, useEffect, useRef } from "react";

const useFetch = (
  url: string,
  { body, lazy = false }: { body?: string; lazy?: boolean }
) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(url) && !lazy);
  const proceed = useRef(true);

  const execute = async (newBody = null) => {
    setLoading(true);

    try {
      const res = await fetch(
        url,
        body && { method: "POST", body: newBody || body }
      );
      const response = await res.json();
      if (proceed) {
        setData(response);
        setLoading(false);
      }
    } catch (error) {
      proceed && setError(error);
    }
  };

  useEffect(() => {
    proceed.current = true;
    setData(null);
    setError(null);
    setLoading(Boolean(url) && !body);
    url && !lazy && execute();

    return () => (proceed.current = false);
  }, [url]);

  return { data, error, loading, execute };
};

export { useFetch };
