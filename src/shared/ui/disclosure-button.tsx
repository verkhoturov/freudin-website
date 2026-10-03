import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

type DisclosureButtonProps = Omit<ComponentProps<"button">, "type"> & {
  expanded: boolean;
  /** id содержимого, которое кнопка показывает и прячет. */
  controls: string;
};

/**
 * Кнопка, которая разворачивает и сворачивает блок. Содержимое прячет сам блок атрибутом
 * `hidden`: оно остаётся в DOM, и поля формы внутри не теряют состояние (в отличие от
 * Collapsible из Radix, который убирает содержимое). Обычно стоит внутри заголовка блока.
 */
export function DisclosureButton({
  expanded,
  controls,
  className,
  children,
  ...props
}: DisclosureButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      className={cn(
        "group/disclosure flex min-w-0 items-center gap-1.5 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      {...props}>
      <ChevronRightIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/disclosure:rotate-90"
      />
      {children}
    </button>
  );
}
