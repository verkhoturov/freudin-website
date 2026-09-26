import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";

/**
 * Удаление аккаунта со всеми данными. Как и после выхода, вызывающий код полностью
 * перезагружает страницу: так сбрасываются кеш запросов и состояние пользователя.
 */
export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: () => apiClient.delete<void>(apiRoutes.me),
  });
}
