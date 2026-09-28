"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getEmptyPracticeInput, type ProfileInput } from "@/entities/profile";
import {
  getAccountPhotos,
  useCreateProfileMutation,
  useViewerQuery,
  type Viewer,
  ViewerGuard,
} from "@/entities/viewer";
import { routes } from "@/shared/config";
import { copyToClipboard } from "@/shared/lib/clipboard";
import { Container } from "@/shared/ui/container";
import { DeleteAccountDialog } from "@/widgets/account-settings";
import { type AvatarValue, getAvatarSource, ProfileForm } from "@/widgets/profile-form";
import { useOnboardingDraftStore } from "../model/draft-store";

export function OnboardingView() {
  return (
    <ViewerGuard access="without-profile">
      <Container className="flex max-w-lg flex-col gap-6 py-10">
        <h1 className="font-semibold text-2xl tracking-tight">Create your page</h1>
        <OnboardingForm />
        {/* Аккаунт, созданный не тем способом входа, иначе не удалить: без страницы нет настроек */}
        <div className="flex flex-col items-start gap-2 border-t pt-6">
          <p className="text-muted-foreground text-sm">Signed in with the wrong account?</p>
          <DeleteAccountDialog username={null} />
        </div>
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
  toast.success("Your page is ready", {
    action: {
      label: "Copy link",
      onClick: async () => {
        if (await copyToClipboard(url)) toast.success("Link copied");
        else toast.error("Couldn’t copy the link");
      },
    },
  });
}

function OnboardingProfileForm({ viewer }: { viewer: Viewer }) {
  const { user, suggestions } = viewer;
  const accountPhotos = getAccountPhotos(user.signInMethods);
  const saveDraft = useOnboardingDraftStore((state) => state.saveDraft);
  const clearDraft = useOnboardingDraftStore((state) => state.clearDraft);
  const createProfile = useCreateProfileMutation();

  // Начальные значения считаем один раз: черновик этого пользователя или данные провайдера.
  // Черновик кладём поверх: в сохранённом раньше может не быть новых полей
  const [defaultValues] = useState<ProfileInput>(() => {
    const suggested: ProfileInput = {
      displayName: suggestions.displayName ?? "",
      username: suggestions.username ?? "",
      bio: "",
      socialLinks: [],
      contactEmail: "",
      // Данные психолога заполняются в настройках (решение 20.2)
      ...getEmptyPracticeInput(),
    };
    const { draft } = useOnboardingDraftStore.getState();
    return draft?.userId === user.id ? { ...suggested, ...draft.values } : suggested;
  });
  const [defaultAvatar] = useState<AvatarValue>(() =>
    accountPhotos[0] ? { type: "provider", provider: accountPhotos[0].provider } : { type: "none" },
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
      toast.error("Couldn’t upload the photo. You can add it later in Settings.");
    }
  };

  return (
    <ProfileForm
      defaultValues={defaultValues}
      defaultAvatar={defaultAvatar}
      accountPhotos={accountPhotos}
      showContactEmail={!user.email}
      submitLabel="Create page"
      onSubmit={submit}
      onValuesChange={(values) => saveDraft({ userId: user.id, values })}
    />
  );
}
