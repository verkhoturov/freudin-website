import "server-only";

export {
  deleteUser,
  exchangeAuthCode,
  getOAuthErrorCode,
  getOAuthSignInUrl,
  signOut,
} from "./api/auth.server";
export {
  getLinkedIdentities,
  getOAuthLinkError,
  getOAuthLinkUrl,
  type IdentityLinkResult,
  type LinkedIdentity,
  toSignInMethod,
  unlinkIdentity,
} from "./api/identities.server";
export {
  completeOidcLink,
  completeOidcSignIn,
  getOidcProvider,
  type OidcProvider,
  oidcProviderSchema,
  startOidcSignIn,
  takeOidcSignInState,
} from "./api/oidc-sign-in.server";
export type { AuthErrorCode } from "./config/auth-errors";
export { type AuthProvider, enabledAuthProviders } from "./config/auth-providers";
export { identityLinkParams } from "./config/identity-link";
export { isAccountDeletionConfirmed } from "./lib/is-account-deletion-confirmed";
export { authProviderSchema, identityLinkInputSchema } from "./model/auth-provider-schema";
export { deleteAccountInputSchema } from "./model/delete-account-schema";
export type { IdentityLinkStart, SignInMethod, Viewer } from "./model/types";
