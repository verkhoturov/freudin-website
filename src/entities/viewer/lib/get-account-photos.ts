import { type AuthProvider, authProviderLabels } from "../config/auth-providers";
import type { SignInMethod } from "../model/types";

/** Фото из аккаунта привязанного провайдера входа для «Use account photo». */
export type AccountPhoto = { provider: AuthProvider; label: string; avatarUrl: string };

export function getAccountPhotos(signInMethods: SignInMethod[]): AccountPhoto[] {
  return signInMethods.flatMap(({ provider, avatarUrl }) =>
    avatarUrl ? [{ provider, label: authProviderLabels[provider], avatarUrl }] : [],
  );
}
