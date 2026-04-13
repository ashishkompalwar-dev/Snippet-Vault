import axios from "axios";

function ensureApiBaseUrl(input) {
  const trimmed = (input || "/api").replace(/\/+$/, "");

  // Accept /api directly for Vite proxy usage.
  if (trimmed === "/api") {
    return trimmed;
  }

  if (trimmed.endsWith("/api")) {
    return trimmed;
  }

  return `${trimmed}/api`;
}

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://snippet-vault-backend.onrender.com";
export const BASE_URL = ensureApiBaseUrl(RAW_BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSnippets() {
  const response = await api.get("/snippets");
  return response.data;
}

export async function createSnippet(payload, token) {
  const response = await api.post("/snippets", payload, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function deleteSnippetById(id, token) {
  const response = await api.delete(`/snippets/${id}`, {
    headers: authHeaders(token),
  });

  return response.data;
}

export async function signUp(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function signIn(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return `Cannot reach backend API at ${BASE_URL}. Start local server and retry.`;
    }

    const message = error.response.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    return fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
