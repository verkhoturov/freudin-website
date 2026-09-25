"use client";

import { ProfileAvatar, type PublicProfile } from "@/entities/profile";
import { SocialLinkButton } from "@/entities/social-link";
import { ShareProfileButton } from "./share-profile-button";

export function ProfileCard({ profile }: { profile: PublicProfile }) {
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
      <ShareProfileButton username={profile.username} displayName={profile.displayName} />
    </article>
  );
}
