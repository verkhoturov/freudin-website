import type { ReactNode } from "react";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

/** Временная заглушка страницы. Удаляем, когда все страницы реализованы. */
export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="font-semibold text-3xl tracking-tight">{title}</h1>
      {description ? <p className="text-foreground/70">{description}</p> : null}
      {children}
    </main>
  );
}
