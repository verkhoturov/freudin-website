import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  parseJsonBody,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  enabledAuthProviders,
  getLinkedIdentities,
  getOAuthLinkUrl,
  getOidcProvider,
  type IdentityLinkStart,
  identityLinkInputSchema,
  startOidcSignIn,
} from "@/entities/viewer/index.server";
import { apiRoutes, routes } from "@/shared/config";

const UNAVAILABLE_MESSAGE = "This sign-in method isn’t available yet.";

/**
 * Старт привязки способа входа к текущему аккаунту: отдаёт адрес провайдера, куда браузер уходит
 * сам. Это POST, а не ссылка: чужой сайт не может запустить привязку (проверка same-origin).
 * Google и Telegram на https возвращаются на `/api/auth/callback/<provider>`, остальные —
 * через OAuth Supabase на `/api/auth/callback?mode=link`.
 */
export const POST = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const { provider } = await parseJsonBody(request, identityLinkInputSchema);
  if (!enabledAuthProviders.includes(provider)) {
    throw new HttpError(400, "bad_request", UNAVAILABLE_MESSAGE);
  }

  const identities = await getLinkedIdentities(supabase);
  if (identities.some((identity) => identity.provider === provider)) {
    throw new HttpError(409, "conflict", "This sign-in method is already connected.");
  }

  const { origin } = new URL(request.url);
  const oidcProvider = getOidcProvider(provider, origin);
  let url: string | null;
  if (oidcProvider) {
    const callbackUrl = new URL(apiRoutes.oidcAuthCallback(oidcProvider), origin);
    url = await startOidcSignIn(oidcProvider, callbackUrl.toString(), routes.settings, claims.sub);
  } else {
    const callbackUrl = new URL(apiRoutes.authCallback, origin);
    callbackUrl.searchParams.set("provider", provider);
    callbackUrl.searchParams.set("mode", "link");
    url = await getOAuthLinkUrl(supabase, provider, callbackUrl.toString());
  }
  if (!url) throw new HttpError(400, "bad_request", UNAVAILABLE_MESSAGE);

  return jsonOk<IdentityLinkStart>({ url }, { headers: NO_STORE_HEADERS });
});
