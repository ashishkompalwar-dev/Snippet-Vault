const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

function buildUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let data = null;
  if (rawBody) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        throw new Error("Server returned malformed JSON.");
      }
    } else {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        data = null;
      }
    }
  }

  if (!response.ok) {
    const messageFromJson = data && typeof data === "object" ? data.message : "";
    const htmlResponse = contentType.includes("text/html") || rawBody.trim().startsWith("<!DOCTYPE");
    const fallbackMessage = htmlResponse
      ? "Server returned HTML instead of JSON. Verify local backend URL and ensure backend is running on http://localhost:5000."
      : `Request failed with status ${response.status}.`;

    const error = new Error(messageFromJson || fallbackMessage);
    error.status = response.status;
    error.body = rawBody;
    throw error;
  }

  if (!rawBody) {
    return null;
  }

  if (data !== null) {
    return data;
  }

  throw new Error("Server returned a non-JSON response.");
}

export async function requestJson(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
}
