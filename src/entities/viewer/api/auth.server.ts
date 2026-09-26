import "server-only";
import {
  isAuthPKCECodeVerifierMissingError,
  type SupabaseClient,
  type SupabaseServerClient,
} from "@/shared/api/index.server";
import { type AuthProvider, authProviders, enabledAuthProviders } from "../config/auth-providers";

type SupabaseProvider = "google" | "facebook" | `custom:${string}`;

// Имена провайдеров в Supabase (`app_metadata.provider`)
const supabaseProviders: Record<AuthProvider, SupabaseProvider> = {
  google: "google",
  facebook: "facebook",
  telegram: "custom:telegram",
};

const authProviderBySupabaseName = new Map<string, AuthProvider>(
  authProviders.map((provider) => [supabaseProviders[provider], provider]),
);

/**
 * Адрес входа через OAuth Supabase, или `null`, если провайдер не подключён. PKCE-верификатор
 * Supabase сохраняет в cookies ответа. Google входит без OAuth Supabase: `startGoogleSignIn`.
 */
export async function getOAuthSignInUrl(
  supabase: SupabaseServerClient,
  provider: Exclude<AuthProvider, "google">,
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

export type CodeExchangeResult =
  | { ok: true; userId: string }
  /** `expired` — в cookies нет PKCE-верификатора: вход начали в другом браузере или давно. */
  | { ok: false; reason: "expired" | "failed" };

/** Обменивает код из OAuth-колбэка на сессию и пишет её в cookies. */
export async function exchangeAuthCode(
  supabase: SupabaseServerClient,
  code: string,
): Promise<CodeExchangeResult> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("Couldn't exchange the code for a session:", error.message);
    return { ok: false, reason: isAuthPKCECodeVerifierMissingError(error) ? "expired" : "failed" };
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
