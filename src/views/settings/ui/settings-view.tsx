"use client";

import { ViewerGuard } from "@/entities/viewer";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

export function SettingsView() {
  return (
    <ViewerGuard access="with-profile">
      <PagePlaceholder title="Настройки" />
    </ViewerGuard>
  );
}
