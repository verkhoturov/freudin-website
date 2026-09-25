import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv } from "@/shared/config/index.server";
import type { Database } from "./database.types";

/**
 * Клиент Supabase от имени пользователя из cookies запроса: publishable key, RLS действует.
 * Создаётся заново на каждый запрос. Обновлённую сессию пишет в cookies ответа, поэтому
 * работает только в route handlers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getServerEnv();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // Второй аргумент — заголовки против кеширования. Route handlers Next.js не кеширует,
      // а Vercel кеширует ответ функции только с s-maxage, поэтому ставим их точечно:
      // ответы с данными сессии отдаются с `Cache-Control: private, no-store`.
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
