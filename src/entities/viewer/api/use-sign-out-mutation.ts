import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";

/**
 * Выход. Кеш здесь не трогаем: после выхода вызывающий код полностью перезагружает страницу,
 * и это сбрасывает все данные пользователя разом.
 */
export function useSignOutMutation() {
  return useMutation({
    mutationFn: () => apiClient.post<void>(apiRoutes.signOut),
  });
}
