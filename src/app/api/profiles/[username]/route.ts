import { HttpError, jsonOk, withErrorHandling } from "@/app/api/_lib";
import { getProfileByUsername, type PublicProfile } from "@/entities/profile/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";

export const GET = withErrorHandling(
  async (_request, { params }: RouteContext<"/api/profiles/[username]">) => {
    const { username } = await params;
    const profile = await getProfileByUsername(createSupabasePublicClient(), username);

    if (!profile) throw new HttpError(404, "not_found", "Страница не найдена.");
    return jsonOk<PublicProfile>(profile);
  },
);
