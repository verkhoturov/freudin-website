import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import { apiRoutes } from "@/shared/config";
import type { AuthProvider } from "../config/auth-providers";
import type { IdentityLinkInput } from "../model/auth-provider-schema";
import type { IdentityLinkStart, SignInMethod } from "../model/types";
import { viewerQueries } from "./viewer-queries";

/**
 * Старт привязки способа входа: возвращает адрес провайдера. Вызывающий код уводит туда браузер,
 * а итог привязки приходит в настройки параметрами адреса (`identityLinkParams`).
 */
export function useLinkIdentityMutation() {
  return useMutation({
    mutationFn: (input: IdentityLinkInput) =>
      apiClient.post<IdentityLinkStart>(apiRoutes.identities, input),
  });
}

/** Отвязка способа входа. Последний отвязать нельзя — `ApiError` 409. */
export function useUnlinkIdentityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: AuthProvider) =>
      apiClient.delete<SignInMethod[]>(apiRoutes.identity(provider)),
    onSuccess: (signInMethods) => {
      queryClient.setQueryData(viewerQueries.me().queryKey, (viewer) =>
        viewer ? { ...viewer, user: { ...viewer.user, signInMethods } } : viewer,
      );
    },
  });
}
