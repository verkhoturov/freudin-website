import type { ReactNode } from "react";
import { Container } from "@/shared/ui/container";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

/** Временная заглушка страницы. Удаляем, когда все страницы реализованы. */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <Container className="flex max-w-2xl flex-col gap-4 py-12 sm:py-16">
      <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h1>
      {description ? <p className="text-lg text-muted-foreground">{description}</p> : null}
      {children}
    </Container>
  );
}
