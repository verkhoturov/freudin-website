import { Button } from "@/shared/ui/button";
import { SupportEmailLink } from "@/shared/ui/support-email-link";

type ErrorStateProps = {
  title?: string;
  /** Повтор: перезапрос данных (страница снова покажет скелетон) или перерисовка. */
  onRetry: () => void;
};

/** Ошибка вместо содержимого страницы: что случилось, кнопка повтора и почта поддержки. */
export function ErrorState({ title = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-page-title">{title}</h1>
        <p className="text-muted-foreground">
          Please try again. If the problem persists, email us at{" "}
          <SupportEmailLink className="text-link underline underline-offset-4" />.
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
