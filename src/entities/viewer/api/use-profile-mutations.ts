import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type AvatarSource,
  type ProfileInput,
  type ProfileUpdateInput,
  type ProviderAvatarRequest,
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

function uploadAvatar(source: AvatarSource): Promise<PublicProfile> {
  if (source.type === "provider") {
    const body: ProviderAvatarRequest = { source: "provider" };
    return apiClient.post<PublicProfile>(apiRoutes.profileAvatar, body);
  }
  const body = new FormData();
  body.set("file", source.file, "avatar");
  return apiClient.post<PublicProfile>(apiRoutes.profileAvatar, body);
}

export type CreateProfileVariables = {
  profile: ProfileInput;
  /** Фото загружается сразу после создания профиля. */
  avatar?: AvatarSource | null;
};

export type CreateProfileResult = {
  profile: PublicProfile;
  /** Профиль создан, но фото загрузить не удалось. */
  avatarError: unknown;
};

/**
 * Создание профиля на онбординге вместе с фото. Кеш обновляется, когда готово всё:
 * иначе гард онбординга увёл бы со страницы до загрузки фото. Занятый адрес — `ApiError` 409
 * с `fields.username`, ошибки валидации — 400 с `fields`.
 */
export function useCreateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profile, avatar }: CreateProfileVariables) => {
      const created = await apiClient.post<PublicProfile>(apiRoutes.profile, profile);
      if (!avatar) return { profile: created, avatarError: null } satisfies CreateProfileResult;
      try {
        return { profile: await uploadAvatar(avatar), avatarError: null };
      } catch (avatarError) {
        return { profile: created, avatarError } satisfies CreateProfileResult;
      }
    },
    onSuccess: ({ profile }) => syncProfileCache(queryClient, profile),
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

/** Новое фото профиля. Слишком большой файл — `ApiError` 413, не картинка — 400. */
export function useSetAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}

/** Удаление фото профиля. */
export function useDeleteAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete<PublicProfile>(apiRoutes.profileAvatar),
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}
