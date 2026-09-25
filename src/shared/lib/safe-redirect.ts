// Браузер выбрасывает из URL табы и переводы строк: «/\t/evil.com» превращается в «//evil.com».
// Поэтому отклоняем пробелы и управляющие символы ASCII целиком.
function hasUnsafeCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Путь для редиректа внутри сайта (например, из `?next=`). Внешние и протокольно-относительные
 * адреса (`https://…`, `//…`, `/\…`) заменяются на `fallback` — защита от open redirect.
 */
export function getSafeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return hasUnsafeCharacters(value) ? fallback : value;
}
