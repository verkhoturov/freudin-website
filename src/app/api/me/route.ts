import { jsonOk, NO_STORE_HEADERS, requireUser, withErrorHandling } from "@/app/api/_lib";
import { getProfileByUserId, getProfileSuggestions } from "@/entities/profile/index.server";
import type { Viewer } from "@/entities/viewer/index.server";

export const GET = withErrorHandling(async () => {
  const { supabase, claims } = await requireUser();
  const email = claims.email || null;
  const profile = await getProfileByUserId(supabase, claims.sub);

  return jsonOk<Viewer>(
    {
      user: { id: claims.sub, email },
      profile,
      suggestions: getProfileSuggestions(claims.user_metadata, email),
    },
    { headers: NO_STORE_HEADERS },
  );
});
