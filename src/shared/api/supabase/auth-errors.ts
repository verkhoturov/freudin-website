import "server-only";
import { isAuthError } from "@supabase/supabase-js";

export {
  isAuthPKCECodeVerifierMissingError,
  isAuthRetryableFetchError,
} from "@supabase/supabase-js";

/** Способ входа уже привязан к другому пользователю Supabase. */
export function isIdentityAlreadyExistsError(error: unknown): boolean {
  return isAuthError(error) && error.code === "identity_already_exists";
}
