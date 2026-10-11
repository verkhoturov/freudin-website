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
 * Он же контейнер `page`: по его ширине карточка решает, где главная кнопка на телефоне.
 */
export function ProfileCanvas({ theme, children }: ProfileCanvasProps) {
  // На телефоне (страница уже 32rem) карточка — во всю ширину, без рамки, скругления
  // и отступов от шапки и подвала. У Classic карточка невидима, но отступ контента тот же
  return (
    <div data-page-theme={theme} className="@container/page flex-1 bg-page-backdrop">
      <Container className="py-page @max-lg/page:p-0">
        <div className="mx-auto max-w-[calc(var(--container-profile)+var(--page-surface-padding)*2)] rounded-2xl border border-page-surface-border bg-page-surface p-(--page-surface-padding) shadow-(--page-surface-shadow) [--background:var(--page-surface)] @max-lg/page:rounded-none @max-lg/page:border-0">
          {children}
        </div>
      </Container>
    </div>
  );
}
