"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Container } from "@/shared/ui/container";

type LegalDocumentProps = {
  title: string;
  /** Дата редакции так, как её видит читатель: «September 26, 2026». */
  lastUpdated: string;
  children: ReactNode;
};

// Типографика длинного текста без плагина typography: заголовки, списки, ссылки и код
const proseClassName = cn(
  "flex flex-col gap-4 leading-7",
  "[&_h2]:mt-6 [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:tracking-tight",
  "[&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-lg",
  "[&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-6",
  "[&_a]:underline [&_a]:underline-offset-4",
  "[&_code]:break-words [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-sm",
);

/** Страница юридического документа: заголовок, дата редакции и текст. */
export function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
  return (
    <Container className="max-w-3xl py-10">
      <article className={proseClassName}>
        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </header>
        {children}
      </article>
    </Container>
  );
}
