"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  getProfileChanges,
  type ProfileInput,
  type PublicProfile,
  toProfileInput,
} from "@/entities/profile";
import {
  useDeleteAvatarMutation,
  useSetAvatarMutation,
  useUpdateProfileMutation,
  useViewerQuery,
  type Viewer,
  ViewerGuard,
} from "@/entities/viewer";
import { Container } from "@/shared/ui/container";
import { AccountSettings } from "@/widgets/account-settings";
import { type AvatarValue, getAvatarSource, ProfileForm } from "@/widgets/profile-form";

export function SettingsView() {
  return (
    <ViewerGuard access="with-profile">
      <Container className="flex max-w-lg flex-col gap-10 py-10">
        <h1 className="font-semibold text-2xl tracking-tight">Настройки</h1>
        <SettingsContent />
      </Container>
    </ViewerGuard>
  );
}

function SettingsContent() {
  const viewer = useViewerQuery();
  // Гард рендерит страницу только пользователю с профилем
  if (!viewer.data?.profile) return null;

  return (
    <>
      <section aria-labelledby="profile-settings-title" className="flex flex-col gap-6">
        <h2 id="profile-settings-title" className="font-semibold text-lg tracking-tight">
          Профиль
        </h2>
        <ProfileSettingsForm viewer={viewer.data} profile={viewer.data.profile} />
      </section>
      <AccountSettings viewer={viewer.data} />
    </>
  );
}

type ProfileSettingsFormProps = { viewer: Viewer; profile: PublicProfile };

function ProfileSettingsForm({ viewer, profile }: ProfileSettingsFormProps) {
  const updateProfile = useUpdateProfileMutation();
  const setAvatar = useSetAvatarMutation();
  const deleteAvatar = useDeleteAvatarMutation();
  // После сохранения форма монтируется заново: начальные значения берутся из нового профиля
  const [formVersion, setFormVersion] = useState(0);

  const submit = async (values: ProfileInput, avatar: AvatarValue) => {
    const changes = getProfileChanges(profile, values);
    if (changes) await updateProfile.mutateAsync(changes);

    const avatarSource = getAvatarSource(avatar);
    if (avatarSource) await setAvatar.mutateAsync(avatarSource);
    else if (avatar.type === "none" && profile.avatarUrl) await deleteAvatar.mutateAsync();

    toast.success("Изменения сохранены");
    setFormVersion((version) => version + 1);
  };

  return (
    <ProfileForm
      key={formVersion}
      defaultValues={toProfileInput(profile)}
      defaultAvatar={{ type: "current" }}
      currentAvatarUrl={profile.avatarUrl}
      providerAvatarUrl={viewer.suggestions.avatarUrl}
      currentUsername={profile.username}
      submitLabel="Сохранить"
      onSubmit={submit}
    />
  );
}
