const pinboardEndpoint = (
  endpoint: string,
  token: string,
  params?: string
): string => {
  return `https://pinboard-api-proxy.now.sh/${endpoint}?auth_token=${token}&format=json${
    params ? `&${params}` : ""
  }`;
};

export { pinboardEndpoint };
