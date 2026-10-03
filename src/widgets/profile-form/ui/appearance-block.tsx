import {
  coverIds,
  coverLabels,
  type PageTheme,
  type ProfileCover,
  pageThemeIds,
  pageThemeLabels,
} from "@/entities/profile";
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
  collapsed: boolean;
  /** Без него блок не сворачивается. */
  onCollapsedChange?: (collapsed: boolean) => void;
};

/**
 * Оформление страницы: пресет фона и карточки и обложка. Стоит над конструктором в такой же
 * рамке и так же сворачивается (`/settings#block-appearance` ведёт к нему).
 */
export function AppearanceBlock({
  theme,
  onThemeChange,
  cover,
  onCoverChange,
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
      <h3 id={titleId} className="flex min-w-0 font-medium text-sm">
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
      </h3>
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
