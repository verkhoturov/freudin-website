"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ProfileVisibility } from "@/entities/profile";
import { useViewerQuery } from "@/entities/viewer";
import { routes, siteConfig } from "@/shared/config";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";
import { ProfileCanvas, ProfileCard } from "@/widgets/profile-card";
import { HiddenPageNotice } from "./hidden-page-notice";

type HiddenProfileViewProps = {
  username: string;
  visibility: Exclude<ProfileVisibility, "public">;
};

/**
 * Скрытая страница. Сервер не знает, кто смотрит (сессия видна только API), поэтому владельца
 * узнаём здесь и показываем ему страницу из `/api/me`, остальным — сообщение или форму пароля.
 */
export function HiddenProfileView({ username, visibility }: HiddenProfileViewProps) {
  const viewer = useViewerQuery();
  const ownProfile = viewer.data?.profile;
  const ownerName = ownProfile?.username === username ? ownProfile.displayName : null;

  useEffect(() => {
    if (ownerName === null) return;
    const previousTitle = document.title;
    const title = `${ownerName} — ${siteConfig.name}`;
    document.title = title;
    return () => {
      if (document.title === title) document.title = previousTitle;
    };
  }, [ownerName]);

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
        {/* Пометка — часть сайта, а не страницы: стоит над холстом в теме сайта. Странице
            с паролем она не нужна (решение пользователя 09.10.2026). На телефоне карточка
            пресета стоит без отступа сверху (ProfileCanvas): отступ под пометкой — её */}
        {visibility === "private" ? (
          <Container className="pt-page max-[32rem]:pb-4">
            <Alert className="mx-auto max-w-profile">
              <AlertDescription>
                Your page is hidden. Only you can see it.{" "}
                <Link href={routes.settingsSection("account")} className="text-link underline">
                  Change in Settings
                </Link>
              </AlertDescription>
            </Alert>
          </Container>
        ) : null}
        <ProfileCanvas theme={ownProfile.pageTheme}>
          <ProfileCard profile={ownProfile} isOwner />
        </ProfileCanvas>
      </>
    );
  }

  return <HiddenPageNotice username={username} visibility={visibility} />;
}
