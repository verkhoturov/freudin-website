import "server-only";
import * as z from "zod";
import type { SupabaseClient } from "@/shared/api/index.server";
import { USERNAME_MAX_LENGTH } from "../config/limits";
import type { ProfileVisibility } from "../config/visibility";
import type { PublicProfile } from "../model/types";
import { getProfileVisibility, readPageAccessToken } from "./page-access.server";
import { getProfileByUsername, PUBLIC_PROFILE_COLUMNS, toPublicProfile } from "./profile.server";

export type VisitorProfile =
  | { status: "visible"; profile: PublicProfile }
  | {
      status: "hidden";
      /** Адрес в нижнем регистре. */
      username: string;
      visibility: Exclude<ProfileVisibility, "public">;
    };

/**
 * Страница глазами гостя: открытая — профиль; с паролем — профиль по действующему токену из
 * cookie запроса, иначе только режим; скрытая от всех — только режим. `null` — адреса нет.
 * Владельцу скрытую страницу показывает клиент: здесь сессии нет.
 */
export async function getVisitorProfile(
  supabase: SupabaseClient,
  username: string,
): Promise<VisitorProfile | null> {
  const profile = await getProfileByUsername(supabase, username);
  if (profile) return { status: "visible", profile };

  const normalized = username.trim().toLowerCase();
  if (!normalized || normalized.length > USERNAME_MAX_LENGTH) return null;
  const visibility = await getProfileVisibility(supabase, normalized);
  if (visibility === null || visibility === "public") return null;

  if (visibility === "password") {
    const token = await readPageAccessToken(normalized);
    const unlocked = token ? await getUnlockedProfile(supabase, normalized, token) : null;
    if (unlocked) return { status: "visible", profile: unlocked };
  }
  return { status: "hidden", username: normalized, visibility };
}

async function getUnlockedProfile(
  supabase: SupabaseClient,
  username: string,
  token: string,
): Promise<PublicProfile | null> {
  // Чужое значение cookie не доводим до базы: параметр функции — uuid
  if (!z.uuid().safeParse(token).success) return null;
  const { data, error } = await supabase
    .rpc("get_unlocked_profile", { p_username: username, p_token: token })
    .select(PUBLIC_PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data ? toPublicProfile(supabase, data) : null;
}
