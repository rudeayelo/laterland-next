import { useFetch } from "./useFetch";
import { useAuth } from "./useAuth";

const useApi = (
  endpoint: string,
  { body, lazy }: { body?: {}; lazy?: boolean }
) => {
  const {
    user: { userToken }
  } = useAuth();

  const { data, error, loading, execute: executeFetch } = useFetch(
    `/api${endpoint}`,
    {
      body: JSON.stringify({ userToken, ...body }),
      lazy
    }
  );

  const execute = (newBody = {}) => {
    executeFetch(JSON.stringify({ userToken, ...body, ...newBody }));
  };

  return { data, error, loading, execute };
};

export { useApi };
