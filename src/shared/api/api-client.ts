import { ApiError, isApiErrorBody } from "./api-error";

type Query = Record<string, string | number | boolean | null | undefined>;

export type ApiRequestOptions = Omit<RequestInit, "method" | "body"> & {
  /** FormData уходит как есть, остальные значения — как JSON. */
  body?: unknown;
  query?: Query;
};

function withQuery(path: string, query?: Query): string {
  if (!query) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  const search = params.toString();
  if (!search) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${search}`;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      response.status,
      "unexpected_response",
      "The server returned an unexpected response.",
    );
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readJson(response).catch(() => null);
  if (isApiErrorBody(body)) {
    const { code, message, fields } = body.error;
    return new ApiError(response.status, code, message, fields);
  }
  return new ApiError(
    response.status,
    "unexpected_response",
    `The server returned error ${response.status}.`,
  );
}

// Запрос без ответа дольше этого считаем сбоем сети. Загрузка файлов на медленной сети дольше
const TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;

function withTimeout(signal: AbortSignal | null | undefined, ms: number) {
  // Без AbortSignal.any (браузеры до 2024 года) запрос живёт без таймаута
  if (typeof AbortSignal.any !== "function") return { signal, timeout: null };
  const timeout = AbortSignal.timeout(ms);
  return { signal: signal ? AbortSignal.any([signal, timeout]) : timeout, timeout };
}

async function request<T>(method: string, path: string, options: ApiRequestOptions = {}) {
  const { body, query, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const { signal, timeout } = withTimeout(
    init.signal,
    body instanceof FormData ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS,
  );
  let response: Response;
  try {
    response = await fetch(withQuery(path, query), {
      ...init,
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    // Отмену запроса (например, TanStack Query через signal) пробрасываем как есть.
    if (init.signal?.aborted) throw error;
    if (timeout?.aborted) {
      throw new ApiError(
        0,
        "network_error",
        "The server is taking too long to respond. Please try again.",
      );
    }
    throw new ApiError(
      0,
      "network_error",
      "Can’t reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await readJson(response)) as T;
}

/** Клиент для собственных API-роутов (`/api/**`). Браузер ходит на сервер только через него. */
export const apiClient = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>("DELETE", path, options),
};
