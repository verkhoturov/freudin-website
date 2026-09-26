"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ProfileInput } from "@/entities/profile";
import {
  useCreateProfileMutation,
  useViewerQuery,
  type Viewer,
  ViewerGuard,
} from "@/entities/viewer";
import { routes } from "@/shared/config";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { Container } from "@/shared/ui/container";
import { type AvatarValue, getAvatarSource, ProfileForm } from "@/widgets/profile-form";
import { useOnboardingDraftStore } from "../model/draft-store";

export function OnboardingView() {
  return (
    <ViewerGuard access="without-profile">
      <Container className="flex max-w-lg flex-col gap-6 py-10">
        <h1 className="font-semibold text-2xl tracking-tight">Создание страницы</h1>
        <OnboardingForm />
      </Container>
    </ViewerGuard>
  );
}

function OnboardingForm() {
  const viewer = useViewerQuery();
  // Гард рендерит форму только вошедшему пользователю
  return viewer.data ? <OnboardingProfileForm viewer={viewer.data} /> : null;
}

function showPageReadyToast(username: string) {
  const url = new URL(routes.profile(username), window.location.origin).toString();
  toast.success("Страница готова", {
    action: {
      label: "Скопировать ссылку",
      onClick: async () => {
        if (await copyToClipboard(url)) toast.success("Ссылка скопирована");
        else toast.error("Не удалось скопировать ссылку");
      },
    },
  });
}

function OnboardingProfileForm({ viewer }: { viewer: Viewer }) {
  const { user, suggestions } = viewer;
  const saveDraft = useOnboardingDraftStore((state) => state.saveDraft);
  const clearDraft = useOnboardingDraftStore((state) => state.clearDraft);
  const createProfile = useCreateProfileMutation();

  // Начальные значения считаем один раз: черновик этого пользователя или данные провайдера
  const [defaultValues] = useState<ProfileInput>(() => {
    const { draft } = useOnboardingDraftStore.getState();
    if (draft?.userId === user.id) return draft.values;
    return {
      displayName: suggestions.displayName ?? "",
      username: suggestions.username ?? "",
      bio: "",
      socialLinks: [],
    };
  });
  const [defaultAvatar] = useState<AvatarValue>(() =>
    suggestions.avatarUrl ? { type: "provider" } : { type: "none" },
  );

  const submit = async (values: ProfileInput, avatar: AvatarValue) => {
    const result = await createProfile.mutateAsync({
      profile: values,
      avatar: getAvatarSource(avatar),
    });
    // Кеш уже знает о профиле: гард сам уведёт на личную страницу
    clearDraft();
    showPageReadyToast(result.profile.username);
    if (result.avatarError) {
      toast.error("Фото загрузить не удалось. Добавьте его позже в настройках.");
    }
  };

  return (
    <ProfileForm
      defaultValues={defaultValues}
      defaultAvatar={defaultAvatar}
      providerAvatarUrl={suggestions.avatarUrl}
      submitLabel="Создать страницу"
      onSubmit={submit}
      onValuesChange={(values) => saveDraft({ userId: user.id, values })}
    />
  );
}
