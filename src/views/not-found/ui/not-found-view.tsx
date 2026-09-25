"use client";

import Link from "next/link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { PagePlaceholder } from "@/shared/ui/page-placeholder";

export function NotFoundView() {
  return (
    <PagePlaceholder
      title="Страница не найдена"
      description="Проверьте адрес или вернитесь на главную.">
      <div>
        <Button asChild variant="outline">
          <Link href={routes.home}>На главную</Link>
        </Button>
      </div>
    </PagePlaceholder>
  );
}
