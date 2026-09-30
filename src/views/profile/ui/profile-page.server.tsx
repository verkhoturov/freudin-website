import "server-only";

import type { Metadata, ResolvingMetadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { getProfileByUsername, type PublicProfile } from "@/entities/profile/index.server";
import { createSupabasePublicClient } from "@/shared/api/index.server";
import { routes, siteConfig } from "@/shared/config";
import { ProfileView } from "./profile-view";

const DESCRIPTION_MAX_LENGTH = 160;

// generateMetadata и страница просят один и тот же профиль: cache превращает два запроса
// к базе в один на время рендера
const getProfile = cache((username: string) =>
  getProfileByUsername(createSupabasePublicClient(), username),
);

// Описание для поисковиков и превью ссылок: начало «О себе» одной строкой
function getDescription({ bio, displayName }: PublicProfile) {
  const text = bio.replace(/\s+/g, " ").trim();
  if (!text) return `${displayName} on ${siteConfig.name}.`;
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`;
}

export async function generateMetadata(
  { params }: PageProps<"/[username]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const profile = await getProfile((await params).username);
  // Страница сама ответит 404, метаданные возьмутся из not-found
  if (!profile) return {};

  const url = routes.profile(profile.username);
  const description = getDescription(profile);
  // В превью ссылки — фото человека, без фото — картинка сайта из opengraph-image.jpg
  const images = profile.avatarUrl
    ? [{ url: profile.avatarUrl, alt: profile.displayName }]
    : (await parent).openGraph?.images;
  return {
    title: profile.displayName,
    description,
    alternates: { canonical: url },
    // openGraph из корневого layout заменяется целиком, поэтому общие поля повторяем
    openGraph: {
      type: "profile",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url,
      title: profile.displayName,
      description,
      username: profile.username,
      images,
    },
    // Фото квадратное: маленькая карточка X, а не широкая, которая обрезала бы его до 2:1
    ...(profile.avatarUrl && { twitter: { card: "summary" } }),
  };
}

/**
 * Личная страница рендерится на сервере (решение пользователя 30.09.2026): контент сразу в HTML
 * для поисковиков и быстрой первой отрисовки, а на несуществующий адрес — настоящий 404.
 */
export async function ProfilePage({ params, searchParams }: PageProps<"/[username]">) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  // Регистр адреса не важен: /Anna ведёт на каноничный /anna с тем же query
  if (username !== profile.username) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
      for (const item of [value ?? []].flat()) query.append(key, item);
    }
    const search = query.size > 0 ? `?${query}` : "";
    permanentRedirect(`${routes.profile(profile.username)}${search}`);
  }

  return <ProfileView profile={profile} />;
}
