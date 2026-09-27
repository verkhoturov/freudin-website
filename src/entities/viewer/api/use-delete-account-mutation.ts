import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { DeleteAccountInput } from "../model/delete-account-schema";

/**
 * Удаление аккаунта со всеми данными. Сервер проверяет подтверждение: username не совпал
 * с профилем — `ApiError` 400. Как и после выхода, вызывающий код полностью перезагружает
 * страницу: так сбрасываются кеш запросов и состояние пользователя.
 */
export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: (input: DeleteAccountInput) =>
      apiClient.delete<void>(apiRoutes.me, { body: input }),
  });
}
