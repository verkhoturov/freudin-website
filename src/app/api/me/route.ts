import { jsonOk, NO_STORE_HEADERS, requireUser, withErrorHandling } from "@/app/api/_lib";
import {
  getContactEmail,
  getProfileByUserId,
  getProfileSuggestions,
  removeUserAvatarFiles,
} from "@/entities/profile/index.server";
import { deleteUser, getAuthProvider, type Viewer } from "@/entities/viewer/index.server";
import { createSupabaseAdminClient } from "@/shared/api/index.server";

export const GET = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  const email = claims.email || null;
  const [profile, contactEmail] = await Promise.all([
    getProfileByUserId(supabase, claims.sub),
    getContactEmail(supabase, claims.sub),
  ]);

  return jsonOk<Viewer>(
    {
      user: {
        id: claims.sub,
        email,
        contactEmail,
        provider: getAuthProvider(claims.app_metadata),
      },
      profile,
      suggestions: getProfileSuggestions(claims.user_metadata, email),
    },
    { headers: NO_STORE_HEADERS },
  );
});

/**
 * Удаление аккаунта: сначала фото (из профиля, затем из Storage), потом пользователь, профиль —
 * каскадом. Если что-то упадёт, данные останутся согласованными, и удаление можно повторить.
 */
export const DELETE = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  const admin = createSupabaseAdminClient();

  await removeUserAvatarFiles(admin, claims.sub);
  await deleteUser(admin, supabase, claims.sub);
  return new Response(null, { status: 204, headers: NO_STORE_HEADERS });
});
