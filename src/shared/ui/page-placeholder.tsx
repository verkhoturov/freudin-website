import type { ReactNode } from "react";
import { Container } from "@/shared/ui/container";

type PagePlaceholderProps = {
  title: string;
  children?: ReactNode;
};

/** Временная заглушка страницы. Удаляем, когда все страницы реализованы. */
export function PagePlaceholder({ title, children }: PagePlaceholderProps) {
  return (
    <Container className="flex flex-col gap-6 py-10">
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      {children}
    </Container>
  );
}
