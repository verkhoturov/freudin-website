import type { Metadata } from "next";
import { routes, siteConfig } from "@/shared/config";

export const metadata: Metadata = {
  // absolute: главной не нужен шаблон «%s — Freudin», название уже в начале
  title: {
    absolute: `${siteConfig.name} — личная страница с фото, описанием и ссылками на соцсети`,
  },
  alternates: { canonical: routes.home },
};
