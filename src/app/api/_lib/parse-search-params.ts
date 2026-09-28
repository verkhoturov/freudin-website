import type { z } from "zod";
import { HttpError } from "./http-error";
import { issuesToFields } from "./parse-json-body";

/** Проверяет query запроса zod-схемой. Повторяющийся параметр берётся первым. Ошибки — 400. */
export function parseSearchParams<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): z.output<Schema> {
  const params: Record<string, string> = {};
  for (const [key, value] of new URL(request.url).searchParams) {
    if (!(key in params)) params[key] = value;
  }

  const result = schema.safeParse(params);
  if (!result.success) {
    throw new HttpError(
      400,
      "validation_error",
      "Some parameters are invalid. Please check them.",
      issuesToFields(result.error.issues),
    );
  }
  return result.data;
}
