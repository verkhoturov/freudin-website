"use client";

import Link from "next/link";
import { ProfileAvatar, type PublicProfile } from "@/entities/profile";
import { SocialLinkButton } from "@/entities/social-link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { ShareProfileButton } from "./share-profile-button";

type ProfileCardProps = {
  profile: PublicProfile;
  /** Страницу смотрит её владелец: показываем «Редактировать». */
  isOwner?: boolean;
};

export function ProfileCard({ profile, isOwner = false }: ProfileCardProps) {
  return (
    <article className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <ProfileAvatar displayName={profile.displayName} avatarUrl={profile.avatarUrl} />
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight">{profile.displayName}</h1>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </header>
      {profile.bio ? <p className="whitespace-pre-line">{profile.bio}</p> : null}
      {profile.socialLinks.length > 0 ? (
        <ul aria-label="Ссылки" className="flex w-full flex-col gap-3">
          {profile.socialLinks.map((link) => (
            <li key={link.url}>
              <SocialLinkButton link={link} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        <ShareProfileButton username={profile.username} displayName={profile.displayName} />
        {isOwner ? (
          <Button asChild variant="ghost">
            <Link href={routes.settings}>Редактировать</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
