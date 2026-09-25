"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { healthQueryOptions } from "@/shared/api";
import { routes, siteConfig } from "@/shared/config";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

const stubPages = [
  { href: routes.login, label: "Вход" },
  { href: routes.onboarding, label: "Создание страницы" },
  { href: routes.settings, label: "Настройки" },
  { href: routes.profile("demo"), label: "Пример личной страницы" },
  { href: routes.privacy, label: "Политика конфиденциальности" },
  { href: routes.terms, label: "Условия использования" },
];

export function HomeView() {
  const health = useQuery(healthQueryOptions());
  const apiStatus = health.isPending ? "проверяем…" : health.isError ? "недоступен" : "работает";

  return (
    <PagePlaceholder title={siteConfig.name} description={siteConfig.description}>
      <nav aria-label="Страницы-заглушки">
        <ul className="flex flex-col gap-2">
          {stubPages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="text-primary underline-offset-4 hover:underline">
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-muted-foreground text-sm" aria-live="polite">
        API: {apiStatus}
      </p>
    </PagePlaceholder>
  );
}
