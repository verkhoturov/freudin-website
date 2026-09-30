"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { profileQueries } from "@/entities/profile";
import { useViewerQuery } from "@/entities/viewer";
import { ApiError } from "@/shared/api";
import { routes, siteConfig } from "@/shared/config";
import { Container } from "@/shared/ui/container";
import { ErrorState } from "@/shared/ui/error-state";
import { NotFoundState } from "@/shared/ui/not-found-state";
import { ProfileCard, ProfileCardSkeleton } from "@/widgets/profile-card";

// Символы адреса страницы в любом регистре: такой путь routes.profile не перекодирует
const USERNAME_CHARS = /^[\w-]+$/;

export function ProfileView() {
  const params = useParams<{ username: string }>();
  // Регистр адреса не важен: /Anna и /anna — одна страница и одна запись в кеше
  const username = params.username.toLowerCase();
  const profile = useQuery(profileQueries.detail(username));
  const viewer = useViewerQuery();
  const displayName = profile.data?.displayName;

  // Каноничный адрес в нижнем регистре. Меняем только строку адреса, без навигации:
  // router.replace заново выставил бы заголовок вкладки из metadata. Состояние истории
  // передаём как есть: без него Next не восстановит страницу по кнопке «Назад»
  useEffect(() => {
    if (params.username === username || !USERNAME_CHARS.test(params.username)) return;
    const { search, hash } = window.location;
    const url = `${routes.profile(username)}${search}${hash}`;
    window.history.replaceState(window.history.state, "", url);
  }, [params.username, username]);

  // Страница рендерится на клиенте, поэтому заголовок вкладки выставляем после загрузки
  useEffect(() => {
    if (!displayName) return;
    const previousTitle = document.title;
    const title = `${displayName} — ${siteConfig.name}`;
    document.title = title;
    return () => {
      // После перехода Next уже выставил заголовок новой страницы: его не трогаем
      if (document.title === title) document.title = previousTitle;
    };
  }, [displayName]);

  if (profile.isPending) {
    return (
      <Container className="py-page">
        <ProfileCardSkeleton />
      </Container>
    );
  }

  if (profile.isError) {
    const isNotFound = profile.error instanceof ApiError && profile.error.status === 404;
    return (
      <Container className="py-page">
        {isNotFound ? (
          <NotFoundState />
        ) : (
          <ErrorState title="Couldn’t load the page" onRetry={() => profile.refetch()} />
        )}
      </Container>
    );
  }

  return (
    <Container className="py-page">
      <ProfileCard
        profile={profile.data}
        isOwner={viewer.data?.profile?.username === profile.data.username}
      />
    </Container>
  );
}
