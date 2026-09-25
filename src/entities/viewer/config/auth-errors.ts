/** Тексты для `?error=` на странице входа. Коды выставляют `/api/auth/*`. */
const authErrorMessages: Record<string, string> = {
  auth_unavailable: "Вход пока недоступен: подключение провайдеров ещё в работе.",
  invalid_provider: "Неизвестный способ входа.",
  access_denied: "Вход отменён.",
  oauth_failed: "Не удалось войти. Попробуйте ещё раз.",
};

export function getAuthErrorMessage(code: string): string {
  return authErrorMessages[code] ?? "Не удалось войти. Попробуйте ещё раз.";
}
