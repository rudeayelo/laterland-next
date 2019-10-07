import { useState, useEffect, useRef } from "react";

const useFetch = (url: string, body?: string) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(url) && !body);
  const proceed = useRef(true);

  const execute = async () => {
    setLoading(true);
    try {
      const res = await fetch(url, body && { method: "POST", body });
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

    url && !body && execute();

    return () => (proceed.current = false);
  }, [url]);

  return { data, error, loading, execute };
};

export { useFetch };
