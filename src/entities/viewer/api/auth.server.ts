import "server-only";
import {
  isAuthPKCECodeVerifierMissingError,
  type SupabaseClient,
  type SupabaseServerClient,
} from "@/shared/api/index.server";
import type { AuthErrorCode } from "../config/auth-errors";
import { type AuthProvider, authProviders, enabledAuthProviders } from "../config/auth-providers";
import { upgradeFacebookPhoto } from "./facebook-photo.server";

type SupabaseProvider = "google" | "facebook" | `custom:${string}`;

/** Имена провайдеров в Supabase (`app_metadata.provider`). */
export const supabaseProviders: Record<AuthProvider, SupabaseProvider> = {
  google: "google",
  facebook: "facebook",
  telegram: "custom:telegram",
};

const authProviderBySupabaseName = new Map<string, AuthProvider>(
  authProviders.map((provider) => [supabaseProviders[provider], provider]),
);

/**
 * Адрес входа через OAuth Supabase, или `null`, если провайдер не подключён. PKCE-верификатор
 * Supabase сохраняет в cookies ответа. Google и Telegram на https входят без OAuth Supabase:
 * `getOidcProvider`.
 */
export async function getOAuthSignInUrl(
  supabase: SupabaseServerClient,
  provider: AuthProvider,
  redirectTo: string,
): Promise<string | null> {
  if (!enabledAuthProviders.includes(provider)) return null;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProviders[provider],
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  return data.url;
}

/**
 * Код ошибки для `/login` по `?error=` и `?error_description=`, с которыми OAuth Supabase
 * возвращает браузер, если вход не удался у провайдера или в самом Supabase.
 */
export function getOAuthErrorCode(error: string, description: string | null): AuthErrorCode {
  if (error === "access_denied") return "access_denied";
  // Провайдер не отдал email, а вход без email в настройках провайдера Supabase выключен
  if (description?.includes("Error getting user email from external provider")) {
    return "email_required";
  }
  return "oauth_failed";
}

export type CodeExchangeResult =
  | { ok: true; userId: string }
  /** `expired` — в cookies нет PKCE-верификатора: вход начали в другом браузере или давно. */
  | { ok: false; reason: "expired" | "failed" };

/**
 * Обменивает код из OAuth-колбэка на сессию и пишет её в cookies. `provider` — через кого
 * входили (его передаёт `/api/auth/sign-in` в адресе возврата): после входа через Facebook
 * фото заменяется на крупное.
 */
export async function exchangeAuthCode(
  supabase: SupabaseServerClient,
  code: string,
  provider: AuthProvider | null,
): Promise<CodeExchangeResult> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("Couldn't exchange the code for a session:", error.message);
    return { ok: false, reason: isAuthPKCECodeVerifierMissingError(error) ? "expired" : "failed" };
  }
  if (provider === "facebook" && data.session.provider_token) {
    await upgradeFacebookPhoto(supabase, data.session.provider_token);
  }
  return { ok: true, userId: data.user.id };
}

/** Через какого провайдера пользователь вошёл, по `app_metadata` из сессии. */
export function getAuthProvider(
  appMetadata: { provider?: string } | undefined,
): AuthProvider | null {
  const name = appMetadata?.provider;
  return name ? (authProviderBySupabaseName.get(name) ?? null) : null;
}

/**
 * Удаляет пользователя через admin API (профиль удаляется каскадно) и cookies его сессии.
 * Файлы в Storage каскадом не удаляются: их удаляют заранее.
 */
export async function deleteUser(
  admin: SupabaseClient,
  supabase: SupabaseServerClient,
  userId: string,
): Promise<void> {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;

  // Аккаунт уже удалён, поэтому сбой выхода не должен превращаться в ошибку запроса
  try {
    await signOut(supabase);
  } catch (signOutError) {
    console.warn("Couldn't clear session cookies of the deleted user:", signOutError);
  }
}

/** Завершает сессию на этом устройстве и удаляет её cookies. Без сессии ничего не делает. */
export async function signOut(supabase: SupabaseServerClient): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
