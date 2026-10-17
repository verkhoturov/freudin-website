import type { ApiErrorBody } from "@/shared/api";
import { HttpError } from "./http-error";

/** Для ответов с данными пользователя: их нельзя кешировать ни браузеру, ни CDN. */
export const NO_STORE_HEADERS = { "Cache-Control": "private, no-store" };

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

function jsonError(
  status: number,
  error: ApiErrorBody["error"],
  headers?: Record<string, string>,
): Response {
  return Response.json({ error } satisfies ApiErrorBody, { status, headers });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    const { status, code, message, fields, headers } = error;
    return jsonError(status, { code, message, fields }, headers);
  }

  console.error(error);
  return jsonError(500, {
    code: "internal_error",
    message: "Something went wrong on our side. Please try again later.",
  });
}
