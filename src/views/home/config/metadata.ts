import type { Metadata } from "next";
import { routes, siteConfig } from "@/shared/config";

export const metadata: Metadata = {
  // absolute: главной не нужен шаблон «%s — Freudin», название уже в начале
  title: {
    absolute: `${siteConfig.name} — a personal page with your photo, bio, and social links`,
  },
  alternates: { canonical: routes.home },
};
