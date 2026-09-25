"use client";

import { ViewerGuard } from "@/entities/viewer";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

export function OnboardingView() {
  return (
    <ViewerGuard access="without-profile">
      <PagePlaceholder title="Создание страницы" />
    </ViewerGuard>
  );
}
