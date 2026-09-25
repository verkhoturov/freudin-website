"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Skeleton } from "@/shared/ui/skeleton";
import type { ViewerAccess } from "../lib/get-viewer-redirect";
import { useViewerRedirect } from "../lib/use-viewer-redirect";

type ViewerGuardProps = {
  access: Exclude<ViewerAccess, "guest">;
  children: ReactNode;
};

/**
 * Гард приватной страницы: пока проверяется сессия — скелетон, без доступа — редирект
 * (гостя на вход, остальных на подходящую страницу), при сбое — ошибка с повтором.
 */
export function ViewerGuard({ access, children }: ViewerGuardProps) {
  const { viewer, isRedirecting } = useViewerRedirect(access);

  if (viewer.isError) {
    return (
      <Container className="flex flex-col items-start gap-6 py-10">
        <h1 className="font-semibold text-2xl tracking-tight">Не удалось загрузить страницу</h1>
        <Button variant="outline" onClick={() => viewer.refetch()}>
          Повторить
        </Button>
      </Container>
    );
  }

  if (viewer.isPending || isRedirecting) {
    return (
      <Container aria-busy="true" className="flex flex-col gap-6 py-10">
        <span className="sr-only">Загрузка…</span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3 max-w-sm" />
      </Container>
    );
  }

  return children;
}
