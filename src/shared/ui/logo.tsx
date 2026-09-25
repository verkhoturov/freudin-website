import Link from "next/link";
import { routes, siteConfig } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={routes.home}
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-lg tracking-tight",
        className,
      )}>
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-xl bg-primary text-base text-primary-foreground">
        F
      </span>
      {siteConfig.name}
    </Link>
  );
}
