const RAW_BASE = import.meta.env.VITE_API_URL;
export const API_BASE = (RAW_BASE || "/api").replace(/\/$/, "");
export class ApiError extends Error {
  status;
  errors;
  constructor(message, status, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
const TOKEN_KEY = "timecraft.admin.token";
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
  }
}
export async function apiRequest(path, options = {}) {
  const { body, auth, raw, headers, ...rest } = options;
  const finalHeaders = new Headers(headers || {});
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders, body: payload });
  } catch {
    throw new ApiError("We could not reach TIMECRAFT right now. Please check your connection.", 0);
  }
  if (raw) {
    if (!response.ok) {
      throw new ApiError("Request failed", response.status);
    }
    return response;
  }
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!isJson) {
    throw new ApiError(
      "The TIMECRAFT service is currently unavailable. Please try again shortly.",
      response.status || 503
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      data.message || "Something went wrong. Please try again.",
      response.status,
      data.errors || {}
    );
  }
  return data;
}
export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => apiRequest(path, { ...options, method: "POST", body }),
  patch: (path, body, options = {}) => apiRequest(path, { ...options, method: "PATCH", body }),
  put: (path, body, options = {}) => apiRequest(path, { ...options, method: "PUT", body }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" })
};
