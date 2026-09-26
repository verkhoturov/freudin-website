import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/shared/config/index.server";
import type { Database } from "./database.types";

/**
 * Клиент Supabase без сессии пользователя: publishable key, роль `anon`, RLS действует.
 * Для публичного чтения в роутах без сессии: cookies не читает и не пишет.
 */
export function createSupabasePublicClient() {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getServerEnv();

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
