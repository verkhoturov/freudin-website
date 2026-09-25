"use client";

import { Container } from "@/shared/ui/container";
import { NotFoundState } from "@/shared/ui/not-found-state";

export function NotFoundView() {
  return (
    <Container className="py-10">
      <NotFoundState />
    </Container>
  );
}
