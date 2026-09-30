/** Тело ответа API с ошибкой — общий контракт route handlers и apiClient. */
export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

/** Проверка тела ошибки без zod: apiClient есть на каждой странице, а zod весит десятки КБ. */
export function isApiErrorBody(body: unknown): body is ApiErrorBody {
  if (typeof body !== "object" || body === null || !("error" in body)) return false;
  const { error } = body;
  if (typeof error !== "object" || error === null) return false;
  const { code, message, fields } = error as Record<string, unknown>;
  return (
    typeof code === "string" &&
    typeof message === "string" &&
    (fields === undefined ||
      (typeof fields === "object" &&
        fields !== null &&
        Object.values(fields).every((value) => typeof value === "string")))
  );
}

/**
 * Ошибка запроса к API. `status: 0` означает, что ответа не было (нет сети).
 * `fields` — ошибки по полям формы, ключ — путь поля через точку.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
