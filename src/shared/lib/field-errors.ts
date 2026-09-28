/** Ошибки поля TanStack Form (строки и issues zod) в формате `FieldError` из shadcn. */
export function toFieldErrors(errors: unknown[]): { message: string }[] {
  return errors.flatMap((error) => {
    if (typeof error === "string") return [{ message: error }];
    if (error && typeof error === "object" && "message" in error) {
      return typeof error.message === "string" ? [{ message: error.message }] : [];
    }
    return [];
  });
}

/** Путь поля из ответа API (`socialLinks.0.url`) в имя поля формы (`socialLinks[0].url`). */
export function toFormFieldName(path: string): string {
  return path.replace(/\.(\d+)(?=\.|$)/g, "[$1]");
}
