"use client";

import Link from "next/link";
import { routes, siteConfig } from "@/shared/config";
import { Container } from "@/shared/ui/container";

const legalLinks = [
  { href: routes.privacy, label: "Политика конфиденциальности" },
  { href: routes.terms, label: "Условия использования" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-3 py-6 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          {siteConfig.name} · {siteConfig.description}
        </p>
        <nav aria-label="Правовая информация">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
