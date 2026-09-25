import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/shared/config/index.server";
import type { Database } from "./database.types";

/**
 * Клиент Supabase с secret key: обходит RLS. Только для служебных операций, которые нельзя
 * сделать от имени пользователя, например удаления аккаунта.
 */
export function createSupabaseAdminClient() {
  const { SUPABASE_URL, SUPABASE_SECRET_KEY } = getServerEnv();

  return createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
