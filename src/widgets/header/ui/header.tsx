"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLoginHref, useViewerQuery } from "@/entities/viewer";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";
import { Skeleton } from "@/shared/ui/skeleton";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { UserMenu } from "./user-menu";

export function Header() {
  const pathname = usePathname();
  const viewer = useViewerQuery();

  return (
    <header className="border-b">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {viewer.isPending ? (
            <Skeleton aria-hidden="true" className="size-8 rounded-full" />
          ) : viewer.data ? (
            <UserMenu viewer={viewer.data} />
          ) : (
            <Button asChild size="sm">
              {/* После входа вернём на текущую страницу */}
              <Link href={getLoginHref(pathname)}>Sign in</Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
