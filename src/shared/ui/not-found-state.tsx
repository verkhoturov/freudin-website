import Link from "next/link";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";

export function NotFoundState({ title = "Страница не найдена" }: { title?: string }) {
  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
      <Button asChild variant="outline">
        <Link href={routes.home}>На главную</Link>
      </Button>
    </div>
  );
}
