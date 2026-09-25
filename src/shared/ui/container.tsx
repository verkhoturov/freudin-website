import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

/** Общий контейнер ширины страницы: шапка, подвал и контент выравниваются по нему. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-5xl px-4 sm:px-6", className)} {...props} />;
}
