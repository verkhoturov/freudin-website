"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Container } from "@/shared/ui/container";

const legalLinks = [
  { href: routes.privacy, label: "Политика конфиденциальности" },
  { href: routes.terms, label: "Условия использования" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <Container className="py-6">
        <nav aria-label="Правовая информация">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
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
