"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import {
  getProfileChanges,
  type ProfileInput,
  type ProfileVisibility,
  type PublicProfile,
  rebaseProfileDraft,
  type SavedProfile,
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
import { ApiError } from "@/shared/api";
import { routes, siteConfig } from "@/shared/config";
import { Button } from "@/shared/ui/button";
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
  profileFormSectionLabels as sectionLabels,
} from "@/widgets/profile-form";
import { DEFAULT_COLLAPSED_BLOCKS, useCollapsedBlocksStore } from "../model/collapsed-blocks-store";
import { type SettingsFormBase, useSettingsDraftStore } from "../model/draft-store";

const SITE_HOST = new URL(siteConfig.url).host;

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
    useCollapsedBlocksStore((state) => state.collapsedByUser[userId]) ?? DEFAULT_COLLAPSED_BLOCKS;
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
        . City, currency and who can see your page are in{" "}
        <Link href={routes.settingsSection("account")} className="text-link underline">
          Account
        </Link>
        .
      </>
    ) : section === "search" ? (
      "Only you can see these details: they aren’t shown on your page. They’re saved for future search and matching, which aren’t available yet."
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
        <Button asChild variant="outline" className="self-start lg:w-full">
          <Link href={routes.profile(profile.username)}>View my page</Link>
        </Button>
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
              <p className="text-muted-foreground text-sm">
                Save applies to changes in all settings sections.
              </p>
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

function toFormBase(saved: SavedProfile): SettingsFormBase {
  return {
    values: toProfileInput(saved.profile, saved.contactEmail, saved.privateDetails),
    version: saved.version,
  };
}

// Версии нет только без профиля, а сюда гард пускает с профилем. Иначе 0: сервер ответит 400
function toViewerBase(viewer: Viewer, profile: PublicProfile): SettingsFormBase {
  const { contactEmail } = viewer.user;
  const version = viewer.profileVersion ?? 0;
  return toFormBase({ profile, contactEmail, privateDetails: viewer.privateDetails, version });
}

// Текст сохранён, а фото нет: говорим об этом вместо общего «Couldn’t save»
function toPhotoNotSavedError(error: unknown): ApiError {
  const isApiError = error instanceof ApiError;
  return new ApiError(
    isApiError ? error.status : 0,
    isApiError ? error.code : "network_error",
    `Your other changes were saved, but the photo wasn’t. ${isApiError ? error.message : "Please try again."}`,
  );
}

type EditSession = {
  /** Ключ формы: после сохранения и конфликта версий она монтируется заново. */
  key: number;
  base: SettingsFormBase;
  /** Значения поверх базы при монтировании: черновик или правки после конфликта. */
  draft: ProfileInput | null;
};

function ProfileSettingsForm({
  viewer,
  profile,
  section,
  header,
  collapsedBlocks,
  onCollapsedChange,
}: ProfileSettingsFormProps) {
  const viewerQuery = useViewerQuery();
  const updateProfile = useUpdateProfileMutation();
  const setAvatar = useSetAvatarMutation();
  const deleteAvatar = useDeleteAvatarMutation();
  const userId = viewer.user.id;
  // Смена раздела форму не пересоздаёт: правки всех разделов живут до Save или Discard.
  // Черновик читаем при монтировании: форма сама отдаёт его, когда закрывается
  const [session, setSession] = useState<EditSession>(() => {
    const { draft } = useSettingsDraftStore.getState();
    if (draft?.userId === userId) return { key: 0, base: draft.base, draft: draft.values };
    return { key: 0, base: toViewerBase(viewer, profile), draft: null };
  });
  const setDraft = useSettingsDraftStore((state) => state.setDraft);
  const { email, contactEmail } = viewer.user;
  const { base } = session;

  // Профиль сохранили в другой вкладке: черновик переносим на свежие данные, и поля, которые
  // здесь не меняли, не вернут чужие правки. Сохранение завершается ошибкой: Save and continue
  // не уводит со страницы
  const continueAfterConflict = async (
    values: ProfileInput,
    hasPhotoChange: boolean,
    conflict: ApiError,
  ): Promise<never> => {
    const latest = await viewerQuery.refetch();
    if (latest.isError || !latest.data?.profile) throw conflict;
    const latestBase = toViewerBase(latest.data, latest.data.profile);
    setSession((current) => ({
      key: current.key + 1,
      base: latestBase,
      draft: rebaseProfileDraft(current.base.values, values, latestBase.values),
    }));
    throw new ApiError(
      conflict.status,
      conflict.code,
      `Your page was updated in another tab. We loaded the latest version and kept your edits here. Review them and save again.${hasPhotoChange ? " Choose your new photo again." : ""}`,
    );
  };

  const submit = async (values: ProfileInput, avatar: AvatarValue) => {
    // Правки могли совпасть с сохранённым после нормализации: `@anna` и `t.me/anna`
    const changes = getProfileChanges(base.values, values);
    const avatarSource = getAvatarSource(avatar);
    const shouldDeleteAvatar = avatar.type === "none" && Boolean(profile.avatarUrl);
    const hasPhotoChange = Boolean(avatarSource) || shouldDeleteAvatar;

    if (!changes && !hasPhotoChange) {
      toast.info("No changes to save");
      setSession((current) => ({ key: current.key + 1, base: current.base, draft: null }));
      return;
    }

    let savedBase = base;
    if (changes) {
      try {
        savedBase = toFormBase(
          await updateProfile.mutateAsync({ changes, expectedVersion: base.version }),
        );
      } catch (error) {
        if (!(error instanceof ApiError && error.code === "version_conflict")) throw error;
        return continueAfterConflict(values, hasPhotoChange, error);
      }
    }

    try {
      if (avatarSource) await setAvatar.mutateAsync(avatarSource);
      else if (shouldDeleteAvatar) await deleteAvatar.mutateAsync();
    } catch (error) {
      if (!changes) throw error;
      // Остальное сохранено: правки считаем от сохранённого, и повторный Save отправит только фото
      setSession((current) => ({ ...current, base: savedBase }));
      throw toPhotoNotSavedError(error);
    }

    toast.success("Changes saved");
    setSession((current) => ({ key: current.key + 1, base: savedBase, draft: null }));
  };

  return (
    <ProfileForm
      key={session.key}
      mode="edit"
      defaultValues={base.values}
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
      accountBlock={(beforeLeave) => (
        <AccountSettings viewer={viewer} profile={profile} beforeLeave={beforeLeave} />
      )}
      // Документы уже опубликованы: их загрузка и удаление идут мимо формы
      renderPreview={(draft) => (
        <ProfileCanvas theme={draft.pageTheme}>
          <ProfileCard profile={{ ...draft, documents: profile.documents }} isPreview />
        </ProfileCanvas>
      )}
      submitLabel="Save"
      onSubmit={submit}
      draftValues={session.draft}
      onDraftChange={(values) => setDraft(values ? { userId, values, base } : null)}
    />
  );
}

function getDocumentsSummary(count: number): string | undefined {
  if (count === 0) return undefined;
  return count === 1 ? "1 document" : `${count} documents`;
}
