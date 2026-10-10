import type { ReactNode } from "react";
import type { PageTheme } from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
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
  // На телефоне (страница уже 32rem) карточка пресета — во всю ширину, без рамки, скругления
  // и отступа от шапки. У Classic карточки нет (globals.css): там отступы контейнера остаются
  const isEdgeToEdge = theme !== "classic";
  return (
    <div data-page-theme={theme} className="@container/page flex-1 bg-page-backdrop">
      <Container className={cn("py-page", isEdgeToEdge && "@max-lg/page:px-0 @max-lg/page:pt-0")}>
        <div
          className={cn(
            "mx-auto max-w-[calc(var(--container-profile)+var(--page-surface-padding)*2)] rounded-2xl border border-page-surface-border bg-page-surface p-(--page-surface-padding) shadow-(--page-surface-shadow) [--background:var(--page-surface)]",
            isEdgeToEdge && "@max-lg/page:rounded-none @max-lg/page:border-0",
          )}>
          {children}
        </div>
      </Container>
    </div>
  );
}
