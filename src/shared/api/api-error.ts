import { z } from "zod";

/** Тело ответа API с ошибкой — общий контракт route handlers и apiClient. */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

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
