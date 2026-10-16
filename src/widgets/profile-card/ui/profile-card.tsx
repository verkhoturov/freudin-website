"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { ProfileSection, PublicProfile } from "@/entities/profile";
import { SocialLinkButton } from "@/entities/social-link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DocumentGallery } from "./document-gallery";
import { FaqList } from "./faq-list";
import { OwnerChecklist } from "./owner-checklist";
import { PageCover } from "./page-cover";
import { getPracticeDetails, PracticeDetails, type PracticeItem } from "./practice-details";
import { getPreferredContactAction, PreferredContactButton } from "./preferred-contact-button";
import { ServiceList } from "./service-list";
import { ShareProfileButton } from "./share-profile-button";

type ProfileCardProps = {
  profile: PublicProfile;
  /** Страницу смотрит её владелец: показываем «Редактировать» и подсказки, что заполнить. */
  isOwner?: boolean;
  /**
   * Превью в редакторе: без Share, Edit и подсказок, имя и заголовок документов — не заголовки
   * (у страницы настроек свой `h1`).
   */
  isPreview?: boolean;
};

export function ProfileCard({ profile, isOwner = false, isPreview = false }: ProfileCardProps) {
  const Name = isPreview ? "p" : "h1";
  // Закреплённая кнопка — только на узкой странице (container query `page` у ProfileCanvas,
  // поэтому и в превью шириной с телефон). На каждой ширине одна копия скрыта display: none:
  // скринридер видит одну кнопку
  const isCtaSticky =
    profile.ctaPlacement === "sticky" && getPreferredContactAction(profile) !== null;
  return (
    <article className="mx-auto flex w-full max-w-profile flex-col items-center gap-6 text-center">
      <PageCover profile={profile} />
      <header className="flex flex-col gap-1">
        <Name className="break-words font-heading text-page-title">{profile.displayName}</Name>
        <p className="text-muted-foreground text-sm">@{profile.username}</p>
      </header>
      {isOwner && !isPreview ? <OwnerChecklist profile={profile} /> : null}
      <PreferredContactButton
        profile={profile}
        className={isCtaSticky ? "@max-lg/page:hidden" : undefined}
      />
      {renderSections(profile, isPreview)}
      {isPreview ? null : (
        <div className="flex flex-wrap justify-center gap-2">
          <ShareProfileButton username={profile.username} displayName={profile.displayName} />
          {isOwner ? (
            <Button asChild variant="ghost">
              <Link href={routes.settings}>Edit</Link>
            </Button>
          ) : null}
        </div>
      )}
      {isCtaSticky ? (
        // В конце карточки: при прокрутке прилипает к низу экрана (в превью — к низу рамки),
        // а в конце страницы встаёт на место и не закрывает подвал. Подложка — цвет карточки
        // во всю её ширину, снизу — отступ под полоску жестов iOS
        <div className="sticky bottom-[var(--page-cta-offset,0px)] -mx-(--page-surface-padding) hidden self-stretch bg-background px-(--page-surface-padding) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] @max-lg/page:block">
          <PreferredContactButton profile={profile} />
        </div>
      ) : null}
    </article>
  );
}

/**
 * Блоки после фото и имени в порядке, который выбрал владелец. Незаполненные пропускаем,
 * идущие подряд пункты практики собираем в один `dl`. Выделенный блок стоит отдельно на фоне
 * `accent`: выделенный пункт практики выходит из общего списка.
 */
function renderSections(profile: PublicProfile, isPreview: boolean): ReactNode[] {
  const highlighted = new Set(profile.highlightedSections);
  const blocks: ReactNode[] = [];
  let practice: PracticeItem[] = [];
  const flushPractice = () => {
    if (practice.length === 0) return;
    blocks.push(<PracticeDetails key={practice[0].section} items={practice} />);
    practice = [];
  };
  const add = (section: ProfileSection, block: ReactNode) => {
    flushPractice();
    blocks.push(
      highlighted.has(section) ? (
        <div key={section} className="flex w-full flex-col items-center rounded-xl bg-accent p-4">
          {block}
        </div>
      ) : (
        <Fragment key={section}>{block}</Fragment>
      ),
    );
  };

  for (const section of profile.sectionOrder) {
    if (section === "bio") {
      if (profile.bio)
        add(section, <p className="max-w-full whitespace-pre-line wrap-anywhere">{profile.bio}</p>);
    } else if (section === "links") {
      if (profile.socialLinks.length > 0) {
        add(
          section,
          <ul aria-label="Links" className="flex w-full flex-col gap-3">
            {profile.socialLinks.map((link) => (
              <li key={link.url}>
                <SocialLinkButton link={link} showIcon={profile.linkIcons} />
              </li>
            ))}
          </ul>,
        );
      }
    } else if (section === "documents") {
      if (profile.documents.length > 0) {
        add(section, <DocumentGallery documents={profile.documents} isPreview={isPreview} />);
      }
    } else if (section === "faq") {
      if (profile.faq.length > 0) add(section, <FaqList faq={profile.faq} isPreview={isPreview} />);
    } else if (section === "services") {
      if (profile.services.length > 0) {
        add(section, <ServiceList services={profile.services} isPreview={isPreview} />);
      }
    } else {
      const details = getPracticeDetails(profile, section);
      if (!details) continue;
      if (highlighted.has(section))
        add(section, <PracticeDetails items={[{ section, details }]} />);
      else practice.push({ section, details });
    }
  }
  flushPractice();
  return blocks;
}
