import type { ReactNode } from "react";
import type { PageTheme } from "@/entities/profile";
import { Container } from "@/shared/ui/container";

type ProfileCanvasProps = {
  theme: PageTheme;
  children: ReactNode;
};

/**
 * Холст личной страницы в цветах пресета (`data-page-theme`): фон за карточкой и карточка.
 * Внутри карточки `--background` — её цвет: на нём стоят кнопки `outline` и обводка фото.
 * Холст растягивается на всю высоту родителя-flex: фон доходит до подвала и до низа превью.
 */
export function ProfileCanvas({ theme, children }: ProfileCanvasProps) {
  return (
    <div data-page-theme={theme} className="flex-1 bg-page-backdrop">
      <Container className="py-page">
        <div className="mx-auto max-w-[calc(var(--container-profile)+var(--page-surface-padding)*2)] rounded-2xl border border-page-surface-border bg-page-surface p-(--page-surface-padding) shadow-(--page-surface-shadow) [--background:var(--page-surface)]">
          {children}
        </div>
      </Container>
    </div>
  );
}
