"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { legalConfig, routes } from "@/shared/config";
import { Container } from "@/shared/ui/container";
import { SupportEmailLink } from "@/shared/ui/support-email-link";
import { useCopyrightYears } from "../lib/use-copyright-years";

const legalLinks = [
  { href: routes.privacy, label: "Privacy Policy" },
  { href: routes.terms, label: "Terms of Service" },
];

export function Footer() {
  const pathname = usePathname();
  const copyrightYears = useCopyrightYears();
  // Настройки — редактор на весь экран, без подвала
  if (pathname === routes.settings) return null;

  return (
    <footer className="border-t">
      <Container className="flex flex-col gap-3 py-6 text-muted-foreground text-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
        </div>
        <p>
          © {copyrightYears} {legalConfig.operatorName} · Identification number{" "}
          {legalConfig.registrationNumber} · {legalConfig.registrationCountry}
        </p>
      </Container>
    </footer>
  );
}
