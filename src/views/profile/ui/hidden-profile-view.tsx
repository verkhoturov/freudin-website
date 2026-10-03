"use client";

import Link from "next/link";
import type { ProfileVisibility } from "@/entities/profile";
import { useViewerQuery } from "@/entities/viewer";
import { routes } from "@/shared/config";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";
import { ProfileCanvas, ProfileCard } from "@/widgets/profile-card";
import { HiddenPageNotice } from "./hidden-page-notice";

type HiddenProfileViewProps = {
  username: string;
  visibility: Exclude<ProfileVisibility, "public">;
};

const ownerNotices = {
  private: "Your page is hidden. Only you can see it.",
  password: "Your page is protected with a password. Visitors need it to see the page.",
} as const;

/**
 * Скрытая страница. Сервер не знает, кто смотрит (сессия видна только API), поэтому владельца
 * узнаём здесь и показываем ему страницу из `/api/me`, остальным — сообщение или форму пароля.
 */
export function HiddenProfileView({ username, visibility }: HiddenProfileViewProps) {
  const viewer = useViewerQuery();
  const ownProfile = viewer.data?.profile;

  if (viewer.isPending) {
    return (
      <Container aria-busy="true" className="flex flex-col gap-4 py-page">
        <span className="sr-only">Loading…</span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </Container>
    );
  }

  if (ownProfile?.username === username) {
    return (
      <>
        {/* Пометка — часть сайта, а не страницы: стоит над холстом в теме сайта */}
        <Container className="pt-page">
          <Alert className="mx-auto max-w-profile">
            <AlertDescription>
              {ownerNotices[visibility]}{" "}
              <Link href={routes.settingsSection("account")} className="text-link underline">
                Change in Settings
              </Link>
            </AlertDescription>
          </Alert>
        </Container>
        <ProfileCanvas theme={ownProfile.pageTheme}>
          <ProfileCard profile={ownProfile} isOwner />
        </ProfileCanvas>
      </>
    );
  }

  return <HiddenPageNotice username={username} visibility={visibility} />;
}
