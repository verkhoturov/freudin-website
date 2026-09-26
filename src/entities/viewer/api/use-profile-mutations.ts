import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type ProfileInput,
  type ProfileUpdateInput,
  type PublicProfile,
  profileQueries,
  usernameQueries,
} from "@/entities/profile/@x/viewer";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import { viewerQueries } from "./viewer-queries";

// Ответ сервера сразу кладём в кеш: профиль в `/api/me` и публичную страницу
function syncProfileCache(queryClient: QueryClient, profile: PublicProfile) {
  const viewerKey = viewerQueries.me().queryKey;
  const previousUsername = queryClient.getQueryData(viewerKey)?.profile?.username;

  queryClient.setQueryData(viewerKey, (viewer) => (viewer ? { ...viewer, profile } : viewer));
  queryClient.setQueryData(profileQueries.detail(profile.username).queryKey, profile);
  if (previousUsername && previousUsername !== profile.username) {
    queryClient.removeQueries({ queryKey: profileQueries.detail(previousUsername).queryKey });
  }
  // Новый адрес занят, старый освободился
  void queryClient.invalidateQueries({ queryKey: usernameQueries.all() });
}

/**
 * Создание профиля на онбординге. Занятый адрес — `ApiError` 409 с `fields.username`,
 * ошибки валидации — 400 с `fields`.
 */
export function useCreateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => apiClient.post<PublicProfile>(apiRoutes.profile, input),
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}

/** Обновление профиля: передаются только изменённые поля. Ошибки — как при создании. */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) =>
      apiClient.patch<PublicProfile>(apiRoutes.profile, input),
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}
