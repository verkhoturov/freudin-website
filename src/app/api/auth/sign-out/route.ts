import { NO_STORE_HEADERS, withErrorHandling } from "@/app/api/_lib";
import { signOut } from "@/entities/viewer/index.server";
import { createSupabaseServerClient } from "@/shared/api/index.server";

/** Выход на этом устройстве. Без сессии тоже отвечает 204: повторный выход — не ошибка. */
export const POST = withErrorHandling(async () => {
  const supabase = await createSupabaseServerClient();
  await signOut(supabase);
  return new Response(null, { status: 204, headers: NO_STORE_HEADERS });
});
