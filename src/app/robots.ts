import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // Служебные страницы не закрываем: поисковик должен их прочитать, чтобы увидеть noindex
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
