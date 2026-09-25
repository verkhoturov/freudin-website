"use client";

import Link from "next/link";
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
  return (
    <PagePlaceholder title={siteConfig.name}>
      <nav aria-label="Страницы">
        <ul className="flex flex-col gap-2">
          {stubPages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="underline underline-offset-4">
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PagePlaceholder>
  );
}
