"use client";

import { useQuery } from "@tanstack/react-query";
import { DEMO_USERNAME, type PublicProfile, profileQueries } from "@/entities/profile";
import { useViewerQuery } from "@/entities/viewer";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { ProfileCanvas, ProfileCard } from "@/widgets/profile-card";

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
    <ProfileCanvas theme={profile.pageTheme}>
      {profile.username === DEMO_USERNAME ? (
        // Психолог вымышленный: страница — пример, а не специалист, к которому можно обратиться
        <Alert className="mx-auto mb-6 max-w-profile">
          <AlertDescription>
            This is an example page. Maria Example is a fictional psychologist, so don’t use these
            contacts to ask for help.
          </AlertDescription>
        </Alert>
      ) : null}
      <ProfileCard
        profile={profile}
        isOwner={viewer.data?.profile?.username === profile.username}
      />
    </ProfileCanvas>
  );
}
