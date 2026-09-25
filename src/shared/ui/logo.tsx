import Link from "next/link";
import { routes, siteConfig } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href={routes.home} className={cn("font-semibold tracking-tight", className)}>
      {siteConfig.name}
    </Link>
  );
}
