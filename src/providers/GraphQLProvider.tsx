import React, { useContext, useEffect, useRef, useState } from "react";
import { GraphQLClient } from "graphql-request";
import { useQuery as useReactQuery } from "react-query";
import { useAuth } from "./AuthProvider";

type GraphQLContext = GraphQLClient;

export const GraphQLContext = React.createContext<GraphQLContext>(null);

const GraphQLProvider = ({ children }) => {
  const {
    user: { userToken }
  } = useAuth();

  const client = new GraphQLClient("/api/graphql", {
    headers: {
      authentication: userToken
    }
  });

  return (
    <GraphQLContext.Provider value={client}>{children}</GraphQLContext.Provider>
  );
};

const useClient = () => {
  const client = useContext(GraphQLContext);

  return client;
};

const useQuery = (key: string, query: string, variables?: {}) => {
  const client = useContext(GraphQLContext);

  const { data, error, isLoading, isFetching } = useReactQuery(
    [key, variables],
    () => client.request(query, variables)
  );

  return { data, error, isLoading, isFetching };
};

const useMutation = (mutation: string, variables?: {}) => {
  const client = useContext(GraphQLContext);
  const [response, setResponse] = useState(null);
  const proceed = useRef(true);

  const execute = async () => {
    try {
      const res = await client.request(mutation, variables);
      proceed.current && setResponse(res);
    } catch (error) {
      proceed.current && setResponse(error.response);
    }
  };

  useEffect(() => () => (proceed.current = false), []);

  return { execute, response };
};

export { GraphQLProvider, useClient, useMutation, useQuery };
