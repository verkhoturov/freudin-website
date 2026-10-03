import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { PageAccessInput } from "../model/schemas";

/** Пароль скрытой страницы: при успехе сервер ставит cookie доступа на 30 дней. */
export function useUnlockPageMutation(username: string) {
  return useMutation({
    mutationFn: (input: PageAccessInput) =>
      apiClient.post<void>(apiRoutes.pageAccess(username), input),
  });
}
