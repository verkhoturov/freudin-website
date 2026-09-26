"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Container } from "@/shared/ui/container";
import { SupportEmailLink } from "@/shared/ui/support-email-link";

const legalLinks = [
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.terms, label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-6 text-muted-foreground text-sm">
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <address className="not-italic">
          <SupportEmailLink className="hover:text-foreground" />
        </address>
      </Container>
    </footer>
  );
}
