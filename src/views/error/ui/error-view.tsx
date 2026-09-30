"use client";

import { Container } from "@/shared/ui/container";
import { ErrorState } from "@/shared/ui/error-state";

type ErrorViewProps = {
  error: Error & { digest?: string };
  /** Перезапрашивает и перерисовывает сегмент (Next.js 16). */
  retry: () => void;
};

/** Ошибка рендера страницы (error.tsx и global-error.tsx). Ошибку в консоль пишет сам React. */
export function ErrorView({ retry }: ErrorViewProps) {
  return (
    <Container className="py-page">
      <ErrorState onRetry={retry} />
    </Container>
  );
}
