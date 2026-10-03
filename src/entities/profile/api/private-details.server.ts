import "server-only";
import type { SupabaseClient } from "@/shared/api/index.server";
import { concernIds } from "../config/concerns";
import { genderIds } from "../config/gender";
import { pickKnown } from "../lib/pick-known";
import type { ProfileUpdateData } from "../model/schemas";
import type { PrivateProfileDetails } from "../model/types";

/**
 * Данные психолога, которые не показываются на странице, из `profile_private`, и пароль скрытой
 * страницы. RLS пускает только владельца. Строки нет — ничего не заполнено.
 */
export async function getPrivateDetails(
  supabase: SupabaseClient,
  userId: string,
): Promise<PrivateProfileDetails> {
  const [details, pageAccess] = await Promise.all([
    supabase
      .from("profile_private")
      .select("birth_date, gender, concerns")
      .eq("id", userId)
      .maybeSingle(),
    // Пароль скрытой страницы: RLS отдаёт его только владельцу
    supabase.from("profile_page_access").select("password").eq("id", userId).maybeSingle(),
  ]);

  if (details.error) throw details.error;
  if (pageAccess.error) throw pageAccess.error;
  const { data } = details;
  return {
    birthDate: data?.birth_date ?? null,
    gender: pickKnown(data?.gender ? [data.gender] : [], genderIds)[0] ?? null,
    concerns: pickKnown(data?.concerns ?? [], concernIds),
    pagePassword: pageAccess.data?.password ?? null,
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
