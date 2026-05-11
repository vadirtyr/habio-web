import { api } from "@/lib/api";

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toLowerCase();
  const body = options.body ? JSON.parse(options.body) : undefined;

  const response = await api({
    url: path,
    method,
    data: body,
    headers: options.headers || {},
  });

  return response.data;
}

export function saveToken(token) {
  localStorage.setItem("habio_token", token);
}

export function getToken() {
  return localStorage.getItem("habio_token");
}

export function logout() {
  localStorage.removeItem("habio_token");
}