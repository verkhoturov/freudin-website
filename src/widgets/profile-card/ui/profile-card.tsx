"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ProfileAvatar, type PublicProfile } from "@/entities/profile";
import { SocialLinkButton } from "@/entities/social-link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DocumentGallery } from "./document-gallery";
import { getPracticeDetails, PracticeDetails, type PracticeItem } from "./practice-details";
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
      {renderSections(profile)}
      <div className="flex flex-wrap justify-center gap-2">
        <ShareProfileButton username={profile.username} displayName={profile.displayName} />
        {isOwner ? (
          <Button asChild variant="ghost">
            <Link href={routes.settings}>Edit</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Блоки после фото и имени в порядке, который выбрал владелец. Незаполненные пропускаем,
 * идущие подряд пункты практики собираем в один `dl`.
 */
function renderSections(profile: PublicProfile): ReactNode[] {
  const blocks: ReactNode[] = [];
  let practice: PracticeItem[] = [];
  const add = (block: ReactNode) => {
    if (practice.length > 0) {
      blocks.push(<PracticeDetails key={practice[0].section} items={practice} />);
      practice = [];
    }
    if (block) blocks.push(block);
  };

  for (const section of profile.sectionOrder) {
    if (section === "bio") {
      if (profile.bio) {
        add(
          <p key={section} className="whitespace-pre-line">
            {profile.bio}
          </p>,
        );
      }
    } else if (section === "links") {
      if (profile.socialLinks.length > 0) {
        add(
          <ul key={section} aria-label="Links" className="flex w-full flex-col gap-3">
            {profile.socialLinks.map((link) => (
              <li key={link.url}>
                <SocialLinkButton link={link} />
              </li>
            ))}
          </ul>,
        );
      }
    } else if (section === "documents") {
      if (profile.documents.length > 0) {
        add(<DocumentGallery key={section} documents={profile.documents} />);
      }
    } else {
      const details = getPracticeDetails(profile, section);
      if (details) practice.push({ section, details });
    }
  }
  add(null);
  return blocks;
}
