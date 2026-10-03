import { HttpError, jsonOk, NO_STORE_HEADERS, withErrorHandling } from "@/app/api/_lib";
import { getVisitorProfile, type PublicProfile } from "@/entities/profile/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";

export const GET = withErrorHandling(
  async (_request, { params }: RouteContext<"/api/profiles/[username]">) => {
    const { username } = await params;
    const result = await getVisitorProfile(createSupabasePublicClient(), username);

    if (!result) throw new HttpError(404, "not_found", "Page not found.");
    if (result.status === "hidden") {
      throw new HttpError(403, "forbidden", "This page has been hidden by its author.");
    }
    const { profile } = result;
    // Страницу с паролем открыл cookie этого гостя: ответ не кешируем
    return jsonOk<PublicProfile>(
      profile,
      profile.visibility === "public" ? undefined : { headers: NO_STORE_HEADERS },
    );
  },
);
