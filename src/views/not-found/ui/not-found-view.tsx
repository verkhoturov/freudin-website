"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

export function NotFoundView() {
  return (
    <PagePlaceholder
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь на главную.">
      <Link href={routes.home} className="underline underline-offset-4">
        На главную
      </Link>
    </PagePlaceholder>
  );
}
