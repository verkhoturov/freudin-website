import "server-only";

export {
  deleteUser,
  exchangeAuthCode,
  getAuthProvider,
  getOAuthErrorCode,
  getOAuthSignInUrl,
  signOut,
} from "./api/auth.server";
export {
  completeOidcSignIn,
  getOidcProvider,
  type OidcProvider,
  oidcProviderSchema,
  startOidcSignIn,
  takeOidcSignInState,
} from "./api/oidc-sign-in.server";
export type { AuthErrorCode } from "./config/auth-errors";
export { type AuthProvider, authProviders } from "./config/auth-providers";
export { isAccountDeletionConfirmed } from "./lib/is-account-deletion-confirmed";
export { authProviderSchema } from "./model/auth-provider-schema";
export { deleteAccountInputSchema } from "./model/delete-account-schema";
export type { Viewer } from "./model/types";
