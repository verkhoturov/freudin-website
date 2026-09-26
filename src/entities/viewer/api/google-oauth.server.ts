import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import type { SupabaseServerClient } from "@/shared/api/index.server";
import { apiRoutes } from "@/shared/config";
import { getServerEnv } from "@/shared/config/index.server";
import { enabledAuthProviders } from "../config/auth-providers";
import type { CodeExchangeResult } from "./auth.server";

/*
 * Вход через Google без OAuth Supabase: Google возвращает браузер на наш домен, а не на
 * `<ref>.supabase.co`. Так на экране Google виден сайт, и бренд можно подтвердить. Код меняем
 * на токены Google сами, а сессию Supabase создаём по ID-токену (`signInWithIdToken`):
 * пользователь тот же, что при входе через OAuth Supabase (Supabase узнаёт его по `sub`).
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKEN_TIMEOUT_MS = 10_000;

/** Cookie с секретами одной попытки входа: живёт от клика по кнопке до возврата от Google. */
const SIGN_IN_COOKIE = "freudin-google-sign-in";
const SIGN_IN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // Lax: cookie придёт при возврате с accounts.google.com, это переход верхнего уровня
  sameSite: "lax",
  path: apiRoutes.googleAuthCallback,
} as const;
const SIGN_IN_MAX_AGE_SECONDS = 10 * 60;

const signInStateSchema = z.object({
  state: z.string().min(1),
  nonce: z.string().min(1),
  codeVerifier: z.string().min(43),
  next: z.string(),
});

export type GoogleSignInState = z.infer<typeof signInStateSchema>;

const tokenResponseSchema = z.object({
  id_token: z.string().min(1),
  access_token: z.string().min(1),
});

function getGoogleClient(): { clientId: string; clientSecret: string } | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = getServerEnv();
  return GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }
    : null;
}

/** Заданы ли `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`. Иначе Google идёт через OAuth Supabase. */
export function isGoogleOAuthConfigured(): boolean {
  return getGoogleClient() !== null;
}

function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

function sha256(value: string, encoding: "hex" | "base64url"): string {
  return createHash("sha256").update(value).digest(encoding);
}

/**
 * Адрес экрана входа Google или `null`, если Google не подключён. `state`, `nonce` и
 * PKCE-верификатор сохраняет в httpOnly-cookie ответа вместе с `next`.
 */
export async function startGoogleSignIn(redirectUri: string, next: string): Promise<string | null> {
  const client = getGoogleClient();
  if (!client || !enabledAuthProviders.includes("google")) return null;

  const signInState: GoogleSignInState = {
    state: randomToken(),
    nonce: randomToken(),
    codeVerifier: randomToken(),
    next,
  };
  (await cookies()).set(SIGN_IN_COOKIE, JSON.stringify(signInState), {
    ...SIGN_IN_COOKIE_OPTIONS,
    maxAge: SIGN_IN_MAX_AGE_SECONDS,
  });

  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    client_id: client.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: signInState.state,
    // Google кладёт nonce в ID-токен как есть, а Supabase сравнивает его с SHA-256 от исходного
    nonce: sha256(signInState.nonce, "hex"),
    code_challenge: sha256(signInState.codeVerifier, "base64url"),
    code_challenge_method: "S256",
    // Google иначе молча входит в последний аккаунт, и сменить его после выхода нельзя
    prompt: "select_account",
  }).toString();
  return url.toString();
}

/**
 * Данные попытки входа из cookie; cookie сразу удаляется, чтобы код нельзя было использовать
 * повторно. `null` — cookie нет (вход начали в другом браузере или давно) или она испорчена.
 */
export async function takeGoogleSignInState(): Promise<GoogleSignInState | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SIGN_IN_COOKIE)?.value;
  if (!value) return null;
  cookieStore.set(SIGN_IN_COOKIE, "", { ...SIGN_IN_COOKIE_OPTIONS, maxAge: 0 });

  try {
    const result = signInStateSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Меняет код от Google на токены и создаёт по ID-токену сессию Supabase (пишет её в cookies).
 * Supabase сам проверяет подпись токена, `aud` (Client ID из настроек провайдера) и `nonce`.
 */
export async function completeGoogleSignIn(
  supabase: SupabaseServerClient,
  {
    code,
    redirectUri,
    signInState,
  }: {
    code: string;
    redirectUri: string;
    signInState: GoogleSignInState;
  },
): Promise<CodeExchangeResult> {
  const client = getGoogleClient();
  if (!client) return { ok: false, reason: "failed" };

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        code,
        client_id: client.clientId,
        client_secret: client.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: signInState.codeVerifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(GOOGLE_TOKEN_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn(
        "Google rejected the authorization code:",
        response.status,
        (await response.text()).replace(/\s+/g, " "),
      );
      return { ok: false, reason: "failed" };
    }

    const tokens = tokenResponseSchema.safeParse(await response.json());
    if (!tokens.success) {
      console.warn("Unexpected Google token response:", z.prettifyError(tokens.error));
      return { ok: false, reason: "failed" };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.data.id_token,
      access_token: tokens.data.access_token,
      nonce: signInState.nonce,
    });
    if (error) {
      console.warn("Supabase rejected the Google ID token:", error.message);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, userId: data.user.id };
  } catch (error) {
    console.warn("Couldn't complete Google sign-in:", error);
    return { ok: false, reason: "failed" };
  }
}
