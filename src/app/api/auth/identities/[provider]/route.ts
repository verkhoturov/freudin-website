import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  authProviderSchema,
  getLinkedIdentities,
  type SignInMethod,
  toSignInMethod,
  unlinkIdentity,
} from "@/entities/viewer/index.server";

/** Отвязка способа входа. Отвечает оставшимися способами. Последний отвязать нельзя — 409. */
export const DELETE = withErrorHandling(
  async (_request, { params }: RouteContext<"/api/auth/identities/[provider]">) => {
    const { supabase } = await requireUser();
    const provider = authProviderSchema.safeParse((await params).provider);
    if (!provider.success) throw new HttpError(404, "not_found", "Unknown sign-in method.");

    const identities = await getLinkedIdentities(supabase);
    const target = identities.find((identity) => identity.provider === provider.data);
    if (!target) throw new HttpError(404, "not_found", "This sign-in method isn’t connected.");
    if (identities.length < 2) {
      throw new HttpError(409, "conflict", "You can’t disconnect your only sign-in method.");
    }

    await unlinkIdentity(supabase, target.identity);
    const remaining = identities.filter((identity) => identity !== target).map(toSignInMethod);
    return jsonOk<SignInMethod[]>(remaining, { headers: NO_STORE_HEADERS });
  },
);
