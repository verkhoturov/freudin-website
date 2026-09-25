"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href={routes.login}>Войти</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
