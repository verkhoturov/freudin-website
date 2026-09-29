import "server-only";
import type { SupabaseClient } from "@/shared/api/index.server";
import { concernIds } from "../config/concerns";
import { genderIds } from "../config/gender";
import { pickKnown } from "../lib/pick-known";
import type { ProfileUpdateData } from "../model/schemas";
import type { PrivateProfileDetails } from "../model/types";

/**
 * Данные психолога, которые не показываются на странице, из `profile_private`. RLS пускает
 * только владельца. Строки нет — ничего не заполнено.
 */
export async function getPrivateDetails(
  supabase: SupabaseClient,
  userId: string,
): Promise<PrivateProfileDetails> {
  const { data, error } = await supabase
    .from("profile_private")
    .select("birth_date, gender, concerns")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return {
    birthDate: data?.birth_date ?? null,
    gender: pickKnown(data?.gender ? [data.gender] : [], genderIds)[0] ?? null,
    concerns: pickKnown(data?.concerns ?? [], concernIds),
  };
}

type PrivateDetailsData = Pick<ProfileUpdateData, "birthDate" | "gender" | "concerns">;

/**
 * Сохраняет переданные поля после zod-схем; пустая строка — значение стёрто. Повторная запись
 * безопасна, поэтому, как контактную почту, её делаем до профиля.
 */
export async function setPrivateDetails(
  supabase: SupabaseClient,
  userId: string,
  data: PrivateDetailsData,
): Promise<void> {
  const row = {
    birth_date: data.birthDate === undefined ? undefined : data.birthDate || null,
    gender: data.gender === undefined ? undefined : data.gender || null,
    concerns: data.concerns,
  };
  if (Object.values(row).every((value) => value === undefined)) return;

  // Upsert меняет только переданные колонки: undefined в JSON не попадает
  const { error } = await supabase.from("profile_private").upsert({ id: userId, ...row });
  if (error) throw error;
}
