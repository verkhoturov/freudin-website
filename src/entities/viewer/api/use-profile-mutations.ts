import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type AvatarSource,
  type PrivateProfileDetails,
  type ProfileInput,
  type ProfileUpdateInput,
  type ProviderAvatarRequest,
  type PublicProfile,
  profileQueries,
  usernameQueries,
} from "@/entities/profile/@x/viewer";
import { ApiError, apiClient } from "@/shared/api";
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

// Контактную почту сервер хранит отдельно от профиля и сохраняет как есть после trim
function syncContactEmailCache(queryClient: QueryClient, contactEmail: string | undefined) {
  if (contactEmail === undefined) return;
  const value = contactEmail.trim() || null;
  queryClient.setQueryData(viewerQueries.me().queryKey, (viewer) =>
    viewer ? { ...viewer, user: { ...viewer.user, contactEmail: value } } : viewer,
  );
}

// Закрытые данные сервер хранит отдельно от профиля. Мутации получают значения после схем
// (`getProfileChanges`), поэтому кладём их в кеш как есть
function syncPrivateDetailsCache(
  queryClient: QueryClient,
  input: Pick<ProfileUpdateInput, "birthDate" | "gender" | "concerns">,
) {
  const changes: Partial<PrivateProfileDetails> = {};
  if (input.birthDate !== undefined) changes.birthDate = input.birthDate.trim() || null;
  if (input.gender !== undefined) changes.gender = input.gender || null;
  if (input.concerns !== undefined) changes.concerns = input.concerns;
  if (Object.keys(changes).length === 0) return;
  queryClient.setQueryData(viewerQueries.me().queryKey, (viewer) =>
    viewer ? { ...viewer, privateDetails: { ...viewer.privateDetails, ...changes } } : viewer,
  );
}

function uploadAvatar(source: AvatarSource): Promise<PublicProfile> {
  if (source.type === "provider") {
    const body: ProviderAvatarRequest = { source: "provider", provider: source.provider };
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
 * с `fields.username`, ошибки валидации — 400 с `fields`. 409 без полей — профиль уже есть.
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
    onSuccess: ({ profile }, variables) => {
      syncContactEmailCache(queryClient, variables.profile.contactEmail || undefined);
      syncPrivateDetailsCache(queryClient, variables.profile);
      syncProfileCache(queryClient, profile);
    },
    onError: (error) => {
      // Профиль уже создан (например, ответ на прошлую отправку не дошёл): кеш `/api/me`
      // устарел. Свежие данные покажут профиль, и гард онбординга уведёт на страницу
      const isProfileExists =
        error instanceof ApiError && error.status === 409 && !error.fields?.username;
      if (isProfileExists) {
        void queryClient.invalidateQueries({ queryKey: viewerQueries.me().queryKey });
      }
    },
  });
}

/** Обновление профиля: передаются только изменённые поля. Ошибки — как при создании. */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) =>
      apiClient.patch<PublicProfile>(apiRoutes.profile, input),
    onSuccess: (profile, input) => {
      syncContactEmailCache(queryClient, input.contactEmail);
      syncPrivateDetailsCache(queryClient, input);
      syncProfileCache(queryClient, profile);
    },
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

export type UploadDocumentVariables = {
  /** Изображение документа после уменьшения и перекодирования на клиенте. */
  file: Blob;
  /** Превью с теми же пропорциями. */
  thumbnail: Blob;
  title: string;
};

/** Новый документ психолога. Шестой документ — `ApiError` 409, не та картинка — 400 или 413. */
export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, thumbnail, title }: UploadDocumentVariables) => {
      const body = new FormData();
      body.set("title", title);
      body.set("file", file, "document");
      body.set("thumbnail", thumbnail, "thumbnail");
      return apiClient.post<PublicProfile>(apiRoutes.profileDocuments, body);
    },
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
  });
}

/** Удаление документа психолога по id. */
export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<PublicProfile>(apiRoutes.profileDocument(id)),
    onSuccess: (profile) => syncProfileCache(queryClient, profile),
    onError: (error) => {
      // Документ уже удалён, например в другой вкладке: список в кеше устарел
      if (error instanceof ApiError && error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: viewerQueries.me().queryKey });
      }
    },
  });
}
