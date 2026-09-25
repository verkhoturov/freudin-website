"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function Header() {
  return (
    <header className="border-b">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href={routes.login}>Войти</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
