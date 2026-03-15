export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const apiUrl = process.env.BACKEND_API_URL || "http://localhost:3000";
  const internalSecret = process.env.INTERNAL_API_SECRET;

  const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (internalSecret) {
    headers.set("x-internal-secret", internalSecret);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};
