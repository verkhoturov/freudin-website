"use client";

import Link from "next/link";
import { DEMO_USERNAME } from "@/entities/profile";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export function HomeView() {
  return (
    <Container className="flex flex-col gap-6 py-10">
      <h1 className="font-semibold text-2xl tracking-tight">
        A personal page with your photo, bio, and social links
      </h1>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={routes.login}>Sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.profile(DEMO_USERNAME)}>See an example</Link>
        </Button>
      </div>
    </Container>
  );
}
