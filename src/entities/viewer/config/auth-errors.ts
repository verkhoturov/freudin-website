/**
 * Тексты для `?error=` на странице входа и `?link_error=` в настройках. Коды выставляют
 * `/api/auth/*`.
 */
const authErrorMessages = {
  auth_unavailable: "This sign-in method isn’t available yet.",
  invalid_provider: "Unknown sign-in method.",
  access_denied: "Sign-in was canceled.",
  email_required:
    "We couldn’t get an email address from this account. Add an email to it or use another sign-in method.",
  auth_expired: "The sign-in attempt has expired. Please try again.",
  oauth_failed: "Couldn’t sign in. Please try again.",
  identity_already_exists:
    "This account is already used to sign in to another Freudin account. To move it here, sign in with it, delete that Freudin account, and connect it again.",
  link_failed: "Couldn’t connect this sign-in method. Please try again.",
};

export type AuthErrorCode = keyof typeof authErrorMessages;

export function getAuthErrorMessage(code: string): string {
  return code in authErrorMessages
    ? authErrorMessages[code as AuthErrorCode]
    : authErrorMessages.oauth_failed;
}
