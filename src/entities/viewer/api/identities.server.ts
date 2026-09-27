import "server-only";
import type { SupabaseServerClient, UserIdentity } from "@/shared/api/index.server";
import type { AuthProvider } from "../config/auth-providers";
import type { SignInMethod } from "../model/types";
import { getAuthProvider, supabaseProviders } from "./auth.server";
import { FACEBOOK_AVATAR_METADATA_KEY } from "./facebook-photo.server";

/** Способ входа вместе с идентичностью Supabase: она нужна, чтобы отвязать способ. */
export type LinkedIdentity = SignInMethod & { identity: UserIdentity };

/** Итог привязки способа входа; ошибки — коды из `auth-errors.ts`. */
export type IdentityLinkResult =
  | { ok: true }
  | { ok: false; error: "identity_already_exists" | "link_failed" };

type Metadata = Record<string, unknown> | undefined;

function readString(data: Metadata, key: string): string | null {
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function httpsOnly(url: string | null): string | null {
  return url?.startsWith("https://") ? url : null;
}

// Google и Facebook дают email, Telegram — username
function getAccountLabel(data: Metadata): string | null {
  const email = readString(data, "email");
  if (email) return email;
  const username = readString(data, "preferred_username") ?? readString(data, "user_name");
  return username ? `@${username}` : null;
}

function getAvatarUrl(provider: AuthProvider, identityData: Metadata, userMetadata: Metadata) {
  // В данных входа Facebook фото 50×50, крупное кладёт в user_metadata `upgradeFacebookPhoto`.
  // Пустая строка там значит, что фото у аккаунта нет
  if (provider === "facebook" && userMetadata && FACEBOOK_AVATAR_METADATA_KEY in userMetadata) {
    return httpsOnly(readString(userMetadata, FACEBOOK_AVATAR_METADATA_KEY));
  }
  return httpsOnly(readString(identityData, "avatar_url") ?? readString(identityData, "picture"));
}

/**
 * Привязанные способы входа текущего пользователя, от первого к последнему. Пользователя читает
 * из Supabase Auth (`getUser`): идентичностей в JWT нет.
 */
export async function getLinkedIdentities(
  supabase: SupabaseServerClient,
): Promise<LinkedIdentity[]> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const userMetadata = data.user.user_metadata;
  const identities = [...(data.user.identities ?? [])].sort((a, b) =>
    (a.created_at ?? "").localeCompare(b.created_at ?? ""),
  );
  return identities.flatMap((identity) => {
    const provider = getAuthProvider(identity);
    if (!provider) return [];
    return [
      {
        provider,
        accountLabel: getAccountLabel(identity.identity_data),
        avatarUrl: getAvatarUrl(provider, identity.identity_data, userMetadata),
        identity,
      },
    ];
  });
}

/** Способ входа для ответа API: без идентичности Supabase. */
export function toSignInMethod({
  provider,
  accountLabel,
  avatarUrl,
}: LinkedIdentity): SignInMethod {
  return { provider, accountLabel, avatarUrl };
}

/**
 * Адрес привязки способа входа через OAuth Supabase. Привязка идёт к пользователю текущей
 * сессии, PKCE-верификатор Supabase сохраняет в cookies ответа.
 */
export async function getOAuthLinkUrl(
  supabase: SupabaseServerClient,
  provider: AuthProvider,
  redirectTo: string,
): Promise<string> {
  const { data, error } = await supabase.auth.linkIdentity({
    provider: supabaseProviders[provider],
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Supabase returned no identity link URL");
  return data.url;
}

/**
 * Итог привязки через OAuth Supabase по `?error=`, `?error_code=` и `?error_description=`
 * адреса возврата. `null` — пользователь отменил привязку у провайдера: это не ошибка.
 */
export function getOAuthLinkError(
  error: string,
  errorCode: string | null,
  description: string | null,
): Extract<IdentityLinkResult, { ok: false }>["error"] | null {
  if (error === "access_denied") return null;
  if (errorCode === "identity_already_exists" || description?.includes("already linked")) {
    return "identity_already_exists";
  }
  return "link_failed";
}

/** Отвязывает способ входа и обновляет сессию: список провайдеров лежит в JWT. */
export async function unlinkIdentity(
  supabase: SupabaseServerClient,
  identity: UserIdentity,
): Promise<void> {
  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;

  const refreshed = await supabase.auth.refreshSession();
  if (refreshed.error) console.warn("Couldn't refresh the session:", refreshed.error.message);
}
