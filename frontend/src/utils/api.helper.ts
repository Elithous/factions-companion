export function getApiUrl(endpoint: string) {
  return `/api/${endpoint}`;
}

export function fetchBackend(endpoint: string, queryParams?: Record<string, string>, options?: RequestInit) {
  let url = getApiUrl(endpoint);
  if (queryParams) {
    url += '?' + new URLSearchParams(queryParams).toString();
  }

  return fetch(url, {
    ...options
  });
}