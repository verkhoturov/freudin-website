import type { z } from "zod";
import { HttpError } from "./http-error";

function issuesToFields(issues: z.core.$ZodIssue[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    if (key && !(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/** Читает JSON из тела запроса и проверяет его zod-схемой. Ошибки — 400 с полями. */
export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<z.output<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "bad_request", "The request body must be valid JSON.");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(
      400,
      "validation_error",
      "Some fields are invalid. Please check them.",
      issuesToFields(result.error.issues),
    );
  }
  return result.data;
}
