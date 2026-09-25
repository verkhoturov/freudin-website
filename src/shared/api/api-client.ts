import { ApiError, apiErrorBodySchema } from "./api-error";

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
      "Сервер вернул ответ в неожиданном формате.",
    );
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await readJson(response).catch(() => null);
  const parsed = apiErrorBodySchema.safeParse(body);
  if (parsed.success) {
    const { code, message, fields } = parsed.data.error;
    return new ApiError(response.status, code, message, fields);
  }
  return new ApiError(
    response.status,
    "unexpected_response",
    `Сервер вернул ошибку ${response.status}.`,
  );
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

  let response: Response;
  try {
    response = await fetch(withQuery(path, query), {
      ...init,
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: "same-origin",
    });
  } catch (error) {
    // Отмену запроса (например, TanStack Query через signal) пробрасываем как есть.
    if (init.signal?.aborted) throw error;
    throw new ApiError(0, "network_error", "Нет связи с сервером. Проверьте подключение.");
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
