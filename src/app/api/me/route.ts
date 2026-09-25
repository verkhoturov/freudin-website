import { jsonOk, requireUser, withErrorHandling } from "@/app/api/_lib";
import type { Viewer } from "@/entities/viewer/index.server";

// Пока отдаёт только пользователя: профиль и подсказки для онбординга появятся на шаге 8 плана.
export const GET = withErrorHandling(async () => {
  const { claims } = await requireUser();

  return jsonOk<Viewer>(
    { user: { id: claims.sub, email: claims.email ?? null } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
