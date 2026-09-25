/** Тексты для `?error=` на странице входа. Коды выставляют `/api/auth/*`. */
const authErrorMessages = {
  auth_unavailable: "Этот способ входа пока недоступен.",
  invalid_provider: "Неизвестный способ входа.",
  access_denied: "Вход отменён.",
  auth_expired: "Попытка входа устарела. Попробуйте ещё раз.",
  oauth_failed: "Не удалось войти. Попробуйте ещё раз.",
};

export type AuthErrorCode = keyof typeof authErrorMessages;

export function getAuthErrorMessage(code: string): string {
  return code in authErrorMessages
    ? authErrorMessages[code as AuthErrorCode]
    : authErrorMessages.oauth_failed;
}
