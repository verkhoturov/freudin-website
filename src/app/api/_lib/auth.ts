import { createSupabaseServerClient, isAuthRetryableFetchError } from "@/shared/api/index.server";
import { HttpError } from "./http-error";

/**
 * Проверяет сессию из cookies и возвращает пользователя с клиентом Supabase от его имени.
 * Без сессии бросает 401. Вызывай в начале обработчика: обновлённая сессия пишется в cookies.
 */
export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  // Сбой сети до Supabase — это 500, а не «не авторизован»: клиент не должен разлогиниваться
  if (isAuthRetryableFetchError(error)) throw error;
  if (!data) throw new HttpError(401, "unauthorized", "Войдите, чтобы продолжить.");

  return { supabase, claims: data.claims };
}
