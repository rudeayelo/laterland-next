import { useFetch } from "./useFetch";
import { useAuth } from "./useAuth";

const useApi = (
  endpoint: string,
  { body, lazy }: { body: {}; lazy?: boolean }
) => {
  const {
    user: { userToken }
  } = useAuth();

  const { data, error, loading, execute } = useFetch(`/api${endpoint}`, {
    body: JSON.stringify({ userToken, ...body }),
    lazy
  });

  return { data, error, loading, execute };
};

export { useApi };
