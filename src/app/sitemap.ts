import type { MetadataRoute } from "next";
import { routes, siteConfig } from "@/shared/config";

/** Публичные статические страницы. Личные страницы пользователей добавим, когда появится БД. */
const publicPages: { path: string; changeFrequency: "weekly" | "yearly"; priority: number }[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.privacy, changeFrequency: "yearly", priority: 0.3 },
  { path: routes.terms, changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency,
    priority,
  }));
}
