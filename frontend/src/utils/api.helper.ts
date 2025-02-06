export function getApiUrl(endpoint: string) {
  return `${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}${endpoint}`;
}

export function fetchBackend(endpoint: string, queryParams?: any, options?: RequestInit) {
  let url = getApiUrl(endpoint);
  if (queryParams) {
    url += '?' + new URLSearchParams(queryParams).toString();
  }

  return fetch(url, {
    ...options
  });
}