import {
  type CtaPlacement,
  coverIds,
  coverLabels,
  ctaPlacementIds,
  ctaPlacementLabels,
  type PageTheme,
  type ProfileCover,
  pageThemeIds,
  pageThemeLabels,
} from "@/entities/profile";
import { Checkbox } from "@/shared/ui/checkbox";
import { DisclosureButton } from "@/shared/ui/disclosure-button";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/shared/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { getBlockElementId } from "./sortable-blocks";

const BLOCK_ID = "appearance";

type AppearanceBlockProps = {
  theme: PageTheme;
  onThemeChange: (theme: PageTheme) => void;
  cover: ProfileCover;
  onCoverChange: (cover: ProfileCover) => void;
  linkIcons: boolean;
  onLinkIconsChange: (linkIcons: boolean) => void;
  /** Место главной кнопки на телефоне; `null` — главной кнопки нет, выбор не показываем. */
  ctaPlacement: CtaPlacement | null;
  onCtaPlacementChange: (placement: CtaPlacement) => void;
  collapsed: boolean;
  /** Без него блок не сворачивается. */
  onCollapsedChange?: (collapsed: boolean) => void;
};

/**
 * Оформление страницы: пресет фона и карточки, обложка, иконки на кнопках и место главной
 * кнопки на телефоне. Стоит над конструктором в такой же
 * рамке и так же сворачивается (`/settings#block-appearance` ведёт к нему).
 */
export function AppearanceBlock({
  theme,
  onThemeChange,
  cover,
  onCoverChange,
  linkIcons,
  onLinkIconsChange,
  ctaPlacement,
  onCtaPlacementChange,
  collapsed,
  onCollapsedChange,
}: AppearanceBlockProps) {
  const titleId = `block-${BLOCK_ID}-title`;
  const contentId = `block-${BLOCK_ID}-content`;
  const isCollapsed = Boolean(onCollapsedChange) && collapsed;

  return (
    <section
      id={getBlockElementId(BLOCK_ID)}
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-xl border bg-background p-3">
      <h2 id={titleId} className="flex min-w-0 font-medium text-sm">
        {onCollapsedChange ? (
          <DisclosureButton
            expanded={!isCollapsed}
            controls={contentId}
            onClick={() => onCollapsedChange(!isCollapsed)}
            className="-my-1 min-h-8 flex-1">
            <span className="truncate">Appearance</span>
          </DisclosureButton>
        ) : (
          <span className="truncate">Appearance</span>
        )}
      </h2>
      {isCollapsed ? (
        <p className="truncate pl-5.5 text-muted-foreground text-sm">
          {pageThemeLabels[theme]} · {coverLabels[cover]}
        </p>
      ) : null}
      <div id={contentId} hidden={isCollapsed} className="flex flex-col gap-6">
        <FieldSet>
          <FieldLegend variant="label">Theme</FieldLegend>
          <RadioGroup
            value={theme}
            onValueChange={(next) => onThemeChange(next as PageTheme)}
            className="grid-cols-2">
            {pageThemeIds.map((id) => (
              <FieldLabel key={id} htmlFor={`page-theme-${id}`}>
                <Field className="gap-2">
                  <ThemeSwatch theme={id} />
                  <span className="flex items-center gap-2 font-normal">
                    <RadioGroupItem id={`page-theme-${id}`} value={id} />
                    {pageThemeLabels[id]}
                  </span>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Cover</FieldLegend>
          <RadioGroup
            value={cover}
            onValueChange={(next) => onCoverChange(next as ProfileCover)}
            aria-describedby="cover-description"
            className="grid-cols-3">
            {coverIds.map((id) => (
              <FieldLabel key={id} htmlFor={`cover-${id}`}>
                <Field className="gap-2">
                  <CoverSketch cover={id} theme={theme} />
                  <span className="flex items-center gap-2 font-normal">
                    <RadioGroupItem id={`cover-${id}`} value={id} />
                    {coverLabels[id]}
                  </span>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldDescription id="cover-description">
            Hero shows your photo large. Without a photo, it looks like Banner.
          </FieldDescription>
        </FieldSet>
        <Field orientation="horizontal">
          <Checkbox
            id="link-icons"
            checked={linkIcons}
            onCheckedChange={(next) => onLinkIconsChange(next === true)}
          />
          <FieldLabel htmlFor="link-icons" className="font-normal">
            Show icons on buttons
          </FieldLabel>
        </Field>
        {ctaPlacement ? (
          <FieldSet>
            <FieldLegend variant="label">Contact button on phones</FieldLegend>
            <RadioGroup
              value={ctaPlacement}
              onValueChange={(next) => onCtaPlacementChange(next as CtaPlacement)}
              aria-describedby="cta-placement-description">
              {ctaPlacementIds.map((id) => (
                <Field key={id} orientation="horizontal">
                  <RadioGroupItem id={`cta-placement-${id}`} value={id} />
                  <FieldLabel htmlFor={`cta-placement-${id}`} className="font-normal">
                    {ctaPlacementLabels[id]}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            <FieldDescription id="cta-placement-description">
              A pinned button stays at the bottom of the screen while visitors scroll.
            </FieldDescription>
          </FieldSet>
        ) : null}
      </div>
    </section>
  );
}

/** Образец пресета в его настоящих цветах: фон, карточка, главная кнопка и выделение. */
function ThemeSwatch({ theme }: { theme: PageTheme }) {
  return (
    <span
      aria-hidden="true"
      data-page-theme={theme}
      className="flex h-14 items-center justify-center rounded-md border bg-page-backdrop">
      <span className="flex h-10 w-11 flex-col justify-center gap-1.5 rounded-sm border border-page-surface-border bg-page-surface px-1.5">
        <span className="h-1.5 rounded-full bg-cta" />
        <span className="h-1.5 rounded-full bg-accent" />
        <span className="h-1.5 rounded-full bg-secondary" />
      </span>
    </span>
  );
}

/** Схема обложки: где фото и баннер относительно имени. Баннер — в цветах выбранного пресета. */
function CoverSketch({ cover, theme }: { cover: ProfileCover; theme: PageTheme }) {
  return (
    <span
      aria-hidden="true"
      data-page-theme={theme}
      className="flex h-14 flex-col items-center gap-1 rounded-md border bg-background p-1.5">
      {cover === "classic" ? <span className="size-5 rounded-full bg-muted-foreground/40" /> : null}
      {cover === "banner" ? (
        <span className="flex w-full flex-col items-center">
          <span className="h-3.5 w-full rounded-sm bg-page-banner" />
          <span className="-mt-2 size-4 rounded-full bg-muted-foreground/40 ring-2 ring-background" />
        </span>
      ) : null}
      {cover === "hero" ? <span className="h-6 w-full rounded-sm bg-muted-foreground/40" /> : null}
      <span className="h-1 w-8 rounded-full bg-muted-foreground/40" />
      <span className="h-1 w-5 rounded-full bg-muted-foreground/25" />
    </span>
  );
}
