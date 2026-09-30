import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

// Ширины — токены --container-* из globals.css. Ширину выбирают пропом, а не классом
// в className: cn не знает наших токенов и не понял бы, что max-w-form перекрывает max-w-site
const widths = {
  site: "max-w-site",
  document: "max-w-document",
  form: "max-w-form",
  "sign-in": "max-w-sign-in",
} as const;

type ContainerProps = ComponentProps<"div"> & {
  /** Ширина колонки. По умолчанию — ширина сайта, как у шапки и подвала. */
  width?: keyof typeof widths;
};

/** Общий контейнер ширины страницы: шапка, подвал и контент выравниваются по нему. */
export function Container({ width = "site", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", widths[width], className)} {...props} />;
}
