"use client";

import { useQuery } from "@tanstack/react-query";
import { type PublicProfile, profileQueries } from "@/entities/profile";
import { useViewerQuery } from "@/entities/viewer";
import { Container } from "@/shared/ui/container";
import { ProfileCard } from "@/widgets/profile-card";

type ProfileViewProps = {
  /** Профиль из серверного рендера страницы. */
  profile: PublicProfile;
};

export function ProfileView({ profile: renderedProfile }: ProfileViewProps) {
  // Данные уже пришли с сервера, но читаем их через кеш запроса: мутации настроек обновляют его,
  // и владелец, вернувшись «Назад» после правки, увидит новую версию, а не снимок роутера
  const { data: profile } = useQuery({
    ...profileQueries.detail(renderedProfile.username),
    initialData: renderedProfile,
  });
  const viewer = useViewerQuery();

  return (
    <Container className="py-page">
      <ProfileCard
        profile={profile}
        isOwner={viewer.data?.profile?.username === profile.username}
      />
    </Container>
  );
}
