import "server-only";
import {
  isAuthPKCECodeVerifierMissingError,
  type SupabaseClient,
  type SupabaseServerClient,
} from "@/shared/api/index.server";
import type { AuthProvider } from "../config/auth-providers";

type SupabaseProvider = "google" | "facebook" | `custom:${string}`;

/** Провайдеры, подключённые в Supabase. Остальные кнопки ведут на «Способ входа недоступен». */
const supabaseProviders: Partial<Record<AuthProvider, SupabaseProvider>> = {
  google: "google",
};

/**
 * Адрес, на который отправляем браузер для входа, или `null`, если провайдер не подключён.
 * PKCE-верификатор Supabase сохраняет в cookies ответа.
 */
export async function getOAuthSignInUrl(
  supabase: SupabaseServerClient,
  provider: AuthProvider,
  redirectTo: string,
): Promise<string | null> {
  const supabaseProvider = supabaseProviders[provider];
  if (!supabaseProvider) return null;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: supabaseProvider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      // Google иначе молча входит в последний аккаунт, и сменить его после выхода нельзя
      queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
    },
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
    console.warn("Не удалось обменять код на сессию:", error.message);
    return { ok: false, reason: isAuthPKCECodeVerifierMissingError(error) ? "expired" : "failed" };
  }
  return { ok: true, userId: data.user.id };
}

// Имена провайдеров в Supabase (`app_metadata.provider`) → провайдеры приложения
const authProviderBySupabaseName: Record<string, AuthProvider> = {
  google: "google",
  facebook: "facebook",
  "custom:telegram": "telegram",
};

/** Через какого провайдера пользователь вошёл, по `app_metadata` из сессии. */
export function getAuthProvider(
  appMetadata: { provider?: string } | undefined,
): AuthProvider | null {
  const name = appMetadata?.provider;
  return name ? (authProviderBySupabaseName[name] ?? null) : null;
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
    console.warn("Не удалось удалить cookies сессии удалённого пользователя:", signOutError);
  }
}

/** Завершает сессию на этом устройстве и удаляет её cookies. Без сессии ничего не делает. */
export async function signOut(supabase: SupabaseServerClient): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
