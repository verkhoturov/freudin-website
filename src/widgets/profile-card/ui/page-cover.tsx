import { ProfileAvatar, type PublicProfile } from "@/entities/profile";

/**
 * Обложка над именем по выбору владельца (`profile.cover`): Classic — круглое фото, Banner —
 * полоса цвета пресета и фото на её краю, Hero — большое фото, без фото — Banner.
 */
export function PageCover({
  profile,
  highPriority = true,
}: {
  profile: PublicProfile;
  highPriority?: boolean;
}) {
  const { cover, displayName, avatarUrl } = profile;

  if (cover === "hero" && avatarUrl) {
    return (
      <ProfileAvatar
        displayName={displayName}
        avatarUrl={avatarUrl}
        size="hero"
        highPriority={highPriority}
      />
    );
  }

  if (cover === "classic")
    return (
      <ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} highPriority={highPriority} />
    );

  return (
    <div className="flex w-full flex-col items-center">
      <div aria-hidden="true" className="h-28 w-full rounded-xl bg-page-banner" />
      {/* Обводка цвета карточки отделяет фото от баннера */}
      <ProfileAvatar
        displayName={displayName}
        avatarUrl={avatarUrl}
        highPriority={highPriority}
        className="-mt-12 ring-4 ring-background"
      />
    </div>
  );
}
