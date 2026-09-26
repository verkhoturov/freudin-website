import "server-only";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** Любой клиент Supabase проекта: от имени пользователя, публичный или admin. */
export type SupabaseClient = BaseSupabaseClient<Database>;
