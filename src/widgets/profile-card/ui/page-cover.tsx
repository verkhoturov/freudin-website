import { AVATAR_CROP_SIZE, ProfileAvatar, type PublicProfile } from "@/entities/profile";

/**
 * Обложка над именем по выбору владельца (`profile.cover`): Classic — круглое фото, Banner —
 * полоса цвета пресета и фото на её краю, Hero — большое фото, без фото — Banner.
 */
export function PageCover({ profile }: { profile: PublicProfile }) {
  const { cover, displayName, avatarUrl } = profile;

  if (cover === "hero" && avatarUrl) {
    return (
      // Без Referer, как у ProfileAvatar: фото провайдера может прийти не из нашего хранилища
      // biome-ignore lint/performance/noImgElement: файл из Supabase Storage, next/image для него не настроен
      <img
        src={avatarUrl}
        alt={displayName}
        width={AVATAR_CROP_SIZE}
        height={AVATAR_CROP_SIZE}
        fetchPriority="high"
        referrerPolicy="no-referrer"
        className="aspect-square w-full rounded-2xl bg-muted object-cover"
      />
    );
  }

  if (cover === "classic") return <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} />;

  return (
    <div className="flex w-full flex-col items-center">
      <div aria-hidden="true" className="h-28 w-full rounded-xl bg-page-banner" />
      {/* Обводка цвета карточки отделяет фото от баннера */}
      <ProfileAvatar
        displayName={displayName}
        avatarUrl={avatarUrl}
        className="-mt-12 ring-4 ring-background"
      />
    </div>
  );
}
