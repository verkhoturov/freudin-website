/** Тексты для `?error=` на странице входа. Коды выставляют `/api/auth/*`. */
const authErrorMessages = {
  auth_unavailable: "This sign-in method isn’t available yet.",
  invalid_provider: "Unknown sign-in method.",
  access_denied: "Sign-in was canceled.",
  auth_expired: "The sign-in attempt has expired. Please try again.",
  oauth_failed: "Couldn’t sign in. Please try again.",
};

export type AuthErrorCode = keyof typeof authErrorMessages;

export function getAuthErrorMessage(code: string): string {
  return code in authErrorMessages
    ? authErrorMessages[code as AuthErrorCode]
    : authErrorMessages.oauth_failed;
}
