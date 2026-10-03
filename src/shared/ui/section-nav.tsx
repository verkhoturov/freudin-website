import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export type SectionNavItem = { href: string; label: string; current?: boolean };

type SectionNavProps = ComponentProps<"nav"> & { items: readonly SectionNavItem[] };

/**
 * Навигация по разделам страницы: на телефоне и планшете — ряд кнопок, от `lg` — колонка
 * сайдбара.
 * Подпись (`aria-label`) и положение (`sticky`, ширина) задаёт страница.
 */
export function SectionNav({ items, className, ...props }: SectionNavProps) {
  return (
    <nav className={className} {...props}>
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {items.map((item) => (
          <li key={item.href}>
            {/* Выбранный раздел — фон accent, и под курсором тоже */}
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start",
                "aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground",
                "aria-[current=page]:hover:bg-accent dark:aria-[current=page]:hover:bg-accent",
              )}>
              <Link href={item.href} aria-current={item.current ? "page" : undefined}>
                {item.label}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
