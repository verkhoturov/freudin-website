import { type AuthProvider, enabledAuthProviders } from "../config/auth-providers";

/**
 * Способ входа можно отвязать, если после этого останется другой, через который можно войти.
 * Отключённый на сайте провайдер (Facebook) таким не считается, сам он отвязывается.
 */
export function canUnlinkSignInMethod(linked: AuthProvider[], target: AuthProvider): boolean {
  return linked.some((provider) => provider !== target && enabledAuthProviders.includes(provider));
}
