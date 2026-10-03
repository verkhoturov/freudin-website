"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import {
  getProfileChanges,
  type ProfileInput,
  type ProfileVisibility,
  type PublicProfile,
  toProfileInput,
} from "@/entities/profile";
import {
  getAccountPhotos,
  useDeleteAvatarMutation,
  useSetAvatarMutation,
  useUpdateProfileMutation,
  useViewerQuery,
  type Viewer,
  ViewerGuard,
} from "@/entities/viewer";
import { routes, siteConfig } from "@/shared/config";
import { Logo } from "@/shared/ui/logo";
import { SectionNav } from "@/shared/ui/section-nav";
import { toast } from "@/shared/ui/sonner";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { AccountSettings } from "@/widgets/account-settings";
import { ProfileCanvas, ProfileCard } from "@/widgets/profile-card";
import { ProfileDocuments } from "@/widgets/profile-documents";
import {
  type AvatarValue,
  getAvatarSource,
  ProfileForm,
  type ProfileFormSection,
} from "@/widgets/profile-form";
import { useCollapsedBlocksStore } from "../model/collapsed-blocks-store";

const SITE_HOST = new URL(siteConfig.url).host;
const NO_COLLAPSED_BLOCKS: string[] = [];

const sectionLabels: Record<ProfileFormSection, string> = {
  account: "Account",
  profile: "Public profile",
  search: "Search details",
};
const sectionIds = Object.keys(sectionLabels) as ProfileFormSection[];

// Кто видит страницу по ссылке — по сохранённому режиму, а не по правкам в форме
const pageAudience: Record<ProfileVisibility, string> = {
  public: "Everyone can see it",
  private: "Your page is hidden. Only you can see it",
  password: "Your page is hidden. Only people with the password can see it",
};
// Чаще всего в настройки приходят править страницу
const DEFAULT_SECTION: ProfileFormSection = "profile";

function toSection(value: string | null): ProfileFormSection {
  return sectionIds.find((id) => id === value) ?? DEFAULT_SECTION;
}

/**
 * Редактор на весь экран: шапки и подвала сайта здесь нет (их прячут сами виджеты), слева
 * сайдбар с логотипом и разделами, справа колонка формы и превью страницы.
 */
export function SettingsView() {
  return (
    <ViewerGuard access="with-profile">
      {/* useSearchParams на статической странице работает только внутри Suspense */}
      <Suspense fallback={null}>
        <SettingsContent />
      </Suspense>
    </ViewerGuard>
  );
}

function SettingsContent() {
  const viewer = useViewerQuery();
  const section = toSection(useSearchParams().get("section"));
  const userId = viewer.data?.user.id ?? "";
  const collapsedBlocks =
    useCollapsedBlocksStore((state) => state.collapsedByUser[userId]) ?? NO_COLLAPSED_BLOCKS;
  const setCollapsed = useCollapsedBlocksStore((state) => state.setCollapsed);
  // Гард рендерит страницу только пользователю с профилем
  if (!viewer.data?.profile) return null;
  const { profile } = viewer.data;
  const onCollapsedChange = (blockId: string, collapsed: boolean) =>
    setCollapsed(userId, blockId, collapsed);
  const description =
    section === "profile" ? (
      <>
        {pageAudience[profile.visibility]} at{" "}
        <Link href={routes.profile(profile.username)} className="text-link underline">
          {SITE_HOST}/{profile.username}
        </Link>
        .
      </>
    ) : section === "search" ? (
      "Not shown on your page. Used to match you with clients."
    ) : null;

  return (
    // Фон muted — холст превью; колонка формы и сайдбар на фоне страницы
    <div className="flex flex-1 flex-col bg-muted lg:flex-row">
      <aside className="flex flex-col gap-4 border-b bg-background p-4 lg:sticky lg:top-0 lg:h-svh lg:w-56 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <ThemeToggle />
        </div>
        <SectionNav
          aria-label="Settings sections"
          items={sectionIds.map((id) => ({
            href: routes.settingsSection(id),
            label: sectionLabels[id],
            current: id === section,
          }))}
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <ProfileSettingsForm
          viewer={viewer.data}
          profile={profile}
          section={section}
          collapsedBlocks={collapsedBlocks}
          onCollapsedChange={onCollapsedChange}
          // Заголовок страницы — раздел: в title вкладки остаётся Settings
          header={
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-page-title">{sectionLabels[section]}</h1>
              {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
            </div>
          }
        />
      </div>
    </div>
  );
}

type ProfileSettingsFormProps = {
  viewer: Viewer;
  profile: PublicProfile;
  section: ProfileFormSection;
  header: ReactNode;
  collapsedBlocks: readonly string[];
  onCollapsedChange: (blockId: string, collapsed: boolean) => void;
};

function ProfileSettingsForm({
  viewer,
  profile,
  section,
  header,
  collapsedBlocks,
  onCollapsedChange,
}: ProfileSettingsFormProps) {
  const updateProfile = useUpdateProfileMutation();
  const setAvatar = useSetAvatarMutation();
  const deleteAvatar = useDeleteAvatarMutation();
  // После сохранения форма монтируется заново: начальные значения берутся из нового профиля.
  // Смена раздела тоже пересоздаёт её: несохранённые правки прежнего раздела сбрасываются
  const [formVersion, setFormVersion] = useState(0);
  const { email, contactEmail } = viewer.user;
  const savedValues = toProfileInput(profile, contactEmail, viewer.privateDetails);

  const submit = async (values: ProfileInput, avatar: AvatarValue) => {
    // Правки могли совпасть с сохранённым после нормализации: `@anna` и `t.me/anna`
    const changes = getProfileChanges(savedValues, values);
    const avatarSource = getAvatarSource(avatar);
    const shouldDeleteAvatar = avatar.type === "none" && Boolean(profile.avatarUrl);

    if (changes || avatarSource || shouldDeleteAvatar) {
      if (changes) await updateProfile.mutateAsync(changes);
      if (avatarSource) await setAvatar.mutateAsync(avatarSource);
      else if (shouldDeleteAvatar) await deleteAvatar.mutateAsync();
      toast.success("Changes saved");
    } else {
      toast.info("No changes to save");
    }
    setFormVersion((version) => version + 1);
  };

  return (
    <ProfileForm
      key={`${section}-${formVersion}`}
      mode="edit"
      defaultValues={savedValues}
      defaultAvatar={{ type: "current" }}
      currentAvatarUrl={profile.avatarUrl}
      accountPhotos={getAccountPhotos(viewer.user.signInMethods)}
      currentUsername={profile.username}
      showContactEmail={!email || contactEmail !== null}
      showPractice
      currentCity={profile.city}
      showSectionOrder
      documentsBlock={<ProfileDocuments documents={profile.documents} />}
      documentsSummary={getDocumentsSummary(profile.documents.length)}
      collapsedBlocks={collapsedBlocks}
      onCollapsedChange={onCollapsedChange}
      section={section}
      layout="workspace"
      header={header}
      accountBlock={<AccountSettings viewer={viewer} profile={profile} />}
      // Документы уже опубликованы: их загрузка и удаление идут мимо формы
      renderPreview={(draft) => (
        <ProfileCanvas theme={draft.pageTheme}>
          <ProfileCard profile={{ ...draft, documents: profile.documents }} isPreview />
        </ProfileCanvas>
      )}
      submitLabel="Save"
      onSubmit={submit}
    />
  );
}

function getDocumentsSummary(count: number): string | undefined {
  if (count === 0) return undefined;
  return count === 1 ? "1 document" : `${count} documents`;
}
