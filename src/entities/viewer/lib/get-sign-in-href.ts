import { apiRoutes } from "@/shared/config";
import type { AuthProvider } from "../config/auth-providers";

/** Ссылка на старт входа. Это полноценный переход, а не fetch: дальше редиректы к провайдеру. */
export function getSignInHref(provider: AuthProvider, next?: string): string {
  const params = new URLSearchParams({ provider });
  if (next) params.set("next", next);
  return `${apiRoutes.signIn}?${params}`;
}
