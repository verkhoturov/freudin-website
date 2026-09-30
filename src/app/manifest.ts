import type { MetadataRoute } from "next";
import { siteConfig, themeColors } from "@/shared/config";

// Иконки в public отрисованы из src/app/icon.svg: 192 и 512 px и maskable — квадрат без
// скругления, точка внутри безопасной зоны (углы срезает система)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    background_color: themeColors.light,
    theme_color: themeColors.light,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
