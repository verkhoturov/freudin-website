import type { ApiErrorBody } from "@/shared/api";
import { HttpError } from "./http-error";

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function jsonError(status: number, error: ApiErrorBody["error"]): Response {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    const { status, code, message, fields } = error;
    return jsonError(status, { code, message, fields });
  }

  console.error(error);
  return jsonError(500, {
    code: "internal_error",
    message: "Внутренняя ошибка сервера. Попробуйте позже.",
  });
}
