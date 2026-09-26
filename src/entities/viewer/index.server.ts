import "server-only";

export {
  deleteUser,
  exchangeAuthCode,
  getAuthProvider,
  getOAuthSignInUrl,
  signOut,
} from "./api/auth.server";
export {
  completeGoogleSignIn,
  isGoogleOAuthConfigured,
  startGoogleSignIn,
  takeGoogleSignInState,
} from "./api/google-oauth.server";
export type { AuthErrorCode } from "./config/auth-errors";
export { type AuthProvider, authProviders } from "./config/auth-providers";
export { authProviderSchema } from "./model/auth-provider-schema";
export type { Viewer } from "./model/types";
