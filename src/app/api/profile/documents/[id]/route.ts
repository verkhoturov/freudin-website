import {
  HttpError,
  jsonOk,
  NO_STORE_HEADERS,
  requireUser,
  withErrorHandling,
} from "@/app/api/_lib";
import { type PublicProfile, removeProfileDocument } from "@/entities/profile/index.server";

/** Удаление документа психолога. Ответ — обновлённый профиль. */
export const DELETE = withErrorHandling(
  async (_request, { params }: RouteContext<"/api/profile/documents/[id]">) => {
    const { supabase, claims } = await requireUser();
    const { id } = await params;
    const result = await removeProfileDocument(supabase, claims.sub, id);

    if (!result.ok) {
      if (result.reason === "document_missing") {
        throw new HttpError(404, "not_found", "This document has already been deleted.");
      }
      throw new HttpError(404, "not_found", "Create your page first.");
    }
    return jsonOk<PublicProfile>(result.profile, { headers: NO_STORE_HEADERS });
  },
);
