"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { profileQueries } from "@/entities/profile";
import { ApiError } from "@/shared/api";
import { siteConfig } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { NotFoundState } from "@/shared/ui/not-found-state";
import { ProfileCard, ProfileCardSkeleton } from "@/widgets/profile-card";

export function ProfileView() {
  const { username } = useParams<{ username: string }>();
  const profile = useQuery(profileQueries.detail(username));
  const displayName = profile.data?.displayName;

  // Страница рендерится на клиенте, поэтому заголовок вкладки выставляем после загрузки
  useEffect(() => {
    if (!displayName) return;
    document.title = `${displayName} — ${siteConfig.name}`;
    return () => {
      document.title = siteConfig.name;
    };
  }, [displayName]);

  if (profile.isPending) {
    return (
      <Container className="py-10">
        <ProfileCardSkeleton />
      </Container>
    );
  }

  if (profile.isError) {
    const isNotFound = profile.error instanceof ApiError && profile.error.status === 404;
    return (
      <Container className="py-10">
        {isNotFound ? (
          <NotFoundState />
        ) : (
          <div className="flex flex-col items-start gap-6">
            <h1 className="font-semibold text-2xl tracking-tight">Не удалось загрузить страницу</h1>
            <Button variant="outline" onClick={() => profile.refetch()}>
              Повторить
            </Button>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <ProfileCard profile={profile.data} />
    </Container>
  );
}
