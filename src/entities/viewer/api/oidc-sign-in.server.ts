import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { isIdentityAlreadyExistsError, type SupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes } from "@/shared/config";
import { getServerEnv } from "@/shared/config/index.server";
import { type AuthProvider, enabledAuthProviders } from "../config/auth-providers";
import { type CodeExchangeResult, supabaseProviders } from "./auth.server";
import type { IdentityLinkResult } from "./identities.server";

/*
 * Вход без OAuth Supabase (Google, Telegram): провайдер возвращает браузер на наш домен, а не на
 * `<ref>.supabase.co`, поэтому на его экране виден сайт. Код меняем на токены сами, а сессию
 * Supabase создаём по ID-токену (`signInWithIdToken`): Supabase узнаёт пользователя по `sub`,
 * поэтому аккаунты, созданные через OAuth Supabase, остались теми же. Тот же путь привязывает
 * способ входа к текущему аккаунту (`linkIdentity` по ID-токену).
 */

export const oidcProviderSchema = z.enum(["google", "telegram"]);

export type OidcProvider = z.infer<typeof oidcProviderSchema>;

type OidcProviderConfig = {
  authUrl: string;
  tokenUrl: string;
  scope: string;
  /** Как передать секрет клиента при обмене кода: в теле запроса или заголовком Basic. */
  clientAuth: "body" | "basic";
  /** Дополнительные параметры адреса экрана входа. */
  authParams?: Record<string, string>;
  getClient: () => { id: string; secret: string };
};

const oidcProviders: Record<OidcProvider, OidcProviderConfig> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientAuth: "body",
    // Google иначе молча входит в последний аккаунт, и сменить его после выхода нельзя
    authParams: { prompt: "select_account" },
    getClient: () => {
      const env = getServerEnv();
      return { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET };
    },
  },
  telegram: {
    authUrl: "https://oauth.telegram.org/auth",
    tokenUrl: "https://oauth.telegram.org/token",
    scope: "openid profile",
    clientAuth: "basic",
    getClient: () => {
      const env = getServerEnv();
      return { id: env.TELEGRAM_CLIENT_ID, secret: env.TELEGRAM_CLIENT_SECRET };
    },
  },
};

const TOKEN_TIMEOUT_MS = 10_000;
const SIGN_IN_MAX_AGE_SECONDS = 10 * 60;

const signInStateSchema = z.object({
  state: z.string().min(1),
  nonce: z.string().min(1),
  codeVerifier: z.string().min(43),
  next: z.string(),
  /** Не вход, а привязка способа входа к этому пользователю. */
  linkUserId: z.string().min(1).optional(),
});

export type OidcSignInState = z.infer<typeof signInStateSchema>;

// Telegram отвечает на ошибку статусом 200, поэтому ответ разбираем по полям, а не по статусу
const tokenResponseSchema = z.union([
  z.object({ id_token: z.string().min(1), access_token: z.string().min(1).optional() }),
  z.object({ error: z.string(), error_description: z.string().optional() }),
]);

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

function sha256(value: string, encoding: "hex" | "base64url"): string {
  return createHash("sha256").update(value).digest(encoding);
}

/** Cookie с секретами одной попытки входа: живёт от клика по кнопке до возврата от провайдера. */
function getSignInCookie(provider: OidcProvider) {
  return {
    name: `freudin-${provider}-sign-in`,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Lax: cookie придёт при возврате от провайдера, это переход верхнего уровня
      sameSite: "lax",
      path: apiRoutes.oidcAuthCallback(provider),
    },
  } as const;
}

/**
 * Входит ли провайдер без OAuth Supabase на сайте с этим `origin`. Telegram не принимает
 * адреса возврата с `http://`, поэтому на localhost входит через OAuth Supabase.
 */
export function getOidcProvider(provider: AuthProvider, origin: string): OidcProvider | null {
  if (provider === "google") return "google";
  if (provider === "telegram" && new URL(origin).protocol === "https:") return "telegram";
  return null;
}

/**
 * Адрес экрана входа провайдера или `null`, если провайдер не подключён. `state`, `nonce`
 * и PKCE-верификатор сохраняет в httpOnly-cookie ответа вместе с `next`. С `linkUserId` —
 * привязка способа входа к этому пользователю.
 */
export async function startOidcSignIn(
  provider: OidcProvider,
  redirectUri: string,
  next: string,
  linkUserId?: string,
): Promise<string | null> {
  if (!enabledAuthProviders.includes(provider)) return null;
  const config = oidcProviders[provider];
  const cookie = getSignInCookie(provider);

  const signInState: OidcSignInState = {
    state: randomToken(),
    nonce: randomToken(),
    codeVerifier: randomToken(),
    next,
    linkUserId,
  };
  (await cookies()).set(cookie.name, JSON.stringify(signInState), {
    ...cookie.options,
    maxAge: SIGN_IN_MAX_AGE_SECONDS,
  });

  const url = new URL(config.authUrl);
  url.search = new URLSearchParams({
    client_id: config.getClient().id,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
    state: signInState.state,
    // Провайдер кладёт nonce в ID-токен как есть, а Supabase сравнивает его с SHA-256 от исходного
    nonce: sha256(signInState.nonce, "hex"),
    code_challenge: sha256(signInState.codeVerifier, "base64url"),
    code_challenge_method: "S256",
    ...config.authParams,
  }).toString();
  return url.toString();
}

/**
 * Данные попытки входа из cookie; cookie сразу удаляется, чтобы код нельзя было использовать
 * повторно. `null` — cookie нет (вход начали в другом браузере или давно) или она испорчена.
 */
export async function takeOidcSignInState(provider: OidcProvider): Promise<OidcSignInState | null> {
  const cookieStore = await cookies();
  const cookie = getSignInCookie(provider);
  const value = cookieStore.get(cookie.name)?.value;
  if (!value) return null;
  cookieStore.set(cookie.name, "", { ...cookie.options, maxAge: 0 });

  try {
    const result = signInStateSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

// Подпись здесь не проверяем: это делает Supabase. Нужно только знать, есть ли в токене nonce
function hasNonceClaim(idToken: string): boolean {
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(idToken.split(".")[1] ?? "", "base64url").toString("utf8"),
    );
    return typeof payload === "object" && payload !== null && "nonce" in payload;
  } catch {
    return false;
  }
}

type Tokens = { idToken: string; accessToken?: string };

function toIdTokenCredentials(
  provider: OidcProvider,
  tokens: Tokens,
  signInState: OidcSignInState,
) {
  return {
    provider: supabaseProviders[provider],
    token: tokens.idToken,
    access_token: tokens.accessToken,
    // Supabase требует nonce, если он есть в токене; без nonce в токене его передавать нельзя
    nonce: hasNonceClaim(tokens.idToken) ? signInState.nonce : undefined,
  };
}

async function requestTokens(
  provider: OidcProvider,
  { code, redirectUri, codeVerifier }: { code: string; redirectUri: string; codeVerifier: string },
): Promise<Tokens | null> {
  const config = oidcProviders[provider];
  const client = config.getClient();
  const body = new URLSearchParams({
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier,
  });
  const headers = new Headers();
  if (config.clientAuth === "basic") {
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(`${client.id}:${client.secret}`).toString("base64")}`,
    );
  } else {
    body.set("client_id", client.id);
    body.set("client_secret", client.secret);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS),
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    // Разбор ниже сообщит о неожиданном ответе
  }

  const tokens = tokenResponseSchema.safeParse(json);
  if (!response.ok || !tokens.success || "error" in tokens.data) {
    console.warn(
      `${provider} rejected the authorization code:`,
      response.status,
      text.replace(/\s+/g, " ").slice(0, 500),
    );
    return null;
  }
  return { idToken: tokens.data.id_token, accessToken: tokens.data.access_token };
}

/**
 * Меняет код провайдера на токены и создаёт по ID-токену сессию Supabase (пишет её в cookies).
 * Supabase сам проверяет подпись токена, `aud` (Client ID из настроек провайдера) и `nonce`.
 */
export async function completeOidcSignIn(
  supabase: SupabaseServerClient,
  provider: OidcProvider,
  {
    code,
    redirectUri,
    signInState,
  }: {
    code: string;
    redirectUri: string;
    signInState: OidcSignInState;
  },
): Promise<CodeExchangeResult> {
  try {
    const tokens = await requestTokens(provider, {
      code,
      redirectUri,
      codeVerifier: signInState.codeVerifier,
    });
    if (!tokens) return { ok: false, reason: "failed" };

    const { data, error } = await supabase.auth.signInWithIdToken(
      toIdTokenCredentials(provider, tokens, signInState),
    );
    if (error) {
      console.warn(`Supabase rejected the ${provider} ID token:`, error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, userId: data.user.id };
  } catch (error) {
    console.warn(`Couldn't complete ${provider} sign-in:`, error);
    return { ok: false, reason: "failed" };
  }
}

/**
 * Привязывает способ входа к текущему пользователю по коду провайдера. Привязка идёт, только если
 * сессия принадлежит тому, кто её начал: пока человек был у провайдера, в браузере мог войти
 * другой пользователь. Supabase сохраняет обновлённую сессию в cookies.
 */
export async function completeOidcLink(
  supabase: SupabaseServerClient,
  provider: OidcProvider,
  {
    code,
    redirectUri,
    signInState,
  }: {
    code: string;
    redirectUri: string;
    signInState: OidcSignInState;
  },
): Promise<IdentityLinkResult> {
  try {
    const { data: session } = await supabase.auth.getClaims();
    if (!signInState.linkUserId || session?.claims.sub !== signInState.linkUserId) {
      console.warn(`The session changed before the ${provider} identity was linked`);
      return { ok: false, error: "link_failed" };
    }

    const tokens = await requestTokens(provider, {
      code,
      redirectUri,
      codeVerifier: signInState.codeVerifier,
    });
    if (!tokens) return { ok: false, error: "link_failed" };

    const { error } = await supabase.auth.linkIdentity(
      toIdTokenCredentials(provider, tokens, signInState),
    );
    if (error) {
      console.warn(`Supabase couldn't link the ${provider} identity:`, error.code, error.message);
      const alreadyExists = isIdentityAlreadyExistsError(error);
      return { ok: false, error: alreadyExists ? "identity_already_exists" : "link_failed" };
    }
    return { ok: true };
  } catch (error) {
    console.warn(`Couldn't link the ${provider} identity:`, error);
    return { ok: false, error: "link_failed" };
  }
}
