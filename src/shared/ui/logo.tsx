import { cn } from "cn";
import Link from "next/link";
import { routes } from "@/shared/config";

/** Логотип — адрес сайта. Розовая точка — знак бренда, она же фавиконка (src/app/icon.svg). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href={routes.home} className={cn("font-semibold text-xl tracking-tight", className)}>
      freud<span className="text-cta">.</span>in
    </Link>
  );
}
