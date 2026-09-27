import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  parseJsonBody,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import {
  getContactEmail,
  getProfileByUserId,
  getProfileSuggestions,
  removeUserAvatarFiles,
} from "@/entities/profile/index.server";
import {
  deleteAccountInputSchema,
  deleteUser,
  getLinkedIdentities,
  isAccountDeletionConfirmed,
  toSignInMethod,
  type Viewer,
} from "@/entities/viewer/index.server";
import { createSupabaseAdminClient } from "@/shared/api/index.server";

export const GET = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  const email = claims.email || null;
  const [profile, contactEmail, identities] = await Promise.all([
    getProfileByUserId(supabase, claims.sub),
    getContactEmail(supabase, claims.sub),
    getLinkedIdentities(supabase),
  ]);

  return jsonOk<Viewer>(
    {
      user: {
        id: claims.sub,
        email,
        contactEmail,
        signInMethods: identities.map(toSignInMethod),
      },
      profile,
      suggestions: getProfileSuggestions(claims.user_metadata, email),
    },
    { headers: NO_STORE_HEADERS },
  );
});

const CONFIRMATION_MISMATCH_MESSAGE = "The username doesn’t match your page.";

/**
 * Удаление аккаунта: сначала фото (из профиля, затем из Storage), потом пользователь, профиль —
 * каскадом. Если что-то упадёт, данные останутся согласованными, и удаление можно повторить.
 * Подтверждение — username профиля в теле запроса: страховка от случайного вызова API.
 * Аккаунт без профиля (онбординг не пройден) удаляется без подтверждения: терять в нём нечего.
 */
export const DELETE = withErrorHandling(async (request) => {
  const { supabase, claims } = await requireUser();
  const { username } = await parseJsonBody(request, deleteAccountInputSchema);
  const profile = await getProfileByUserId(supabase, claims.sub);
  if (profile && !isAccountDeletionConfirmed(username ?? "", profile.username)) {
    throw new HttpError(400, "validation_error", CONFIRMATION_MISMATCH_MESSAGE, {
      username: CONFIRMATION_MISMATCH_MESSAGE,
    });
  }

  const admin = createSupabaseAdminClient();

  await removeUserAvatarFiles(admin, claims.sub);
  await deleteUser(admin, supabase, claims.sub);
  return new Response(null, { status: 204, headers: NO_STORE_HEADERS });
});
