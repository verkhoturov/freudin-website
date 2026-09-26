import "server-only";
import type { SupabaseClient } from "@/shared/api/index.server";

/** Контактная почта пользователя из `account_contacts` или `null`. RLS пускает только владельца. */
export async function getContactEmail(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("account_contacts")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.email ?? null;
}

/** Сохраняет контактную почту после `contactEmailSchema`; пустая строка удаляет её. */
export async function setContactEmail(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<void> {
  const { error } = email
    ? await supabase.from("account_contacts").upsert({ id: userId, email })
    : await supabase.from("account_contacts").delete().eq("id", userId);
  if (error) throw error;
}
