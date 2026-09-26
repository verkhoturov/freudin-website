export const siteConfig = {
  name: "Freudin",
  description: "A personal page with your photo, bio, and social links.",
  /**
   * Основной прод-адрес (`freud.in` редиректит на него): база для canonical, Open Graph,
   * robots.txt и sitemap.xml.
   */
  url: "https://www.freud.in",
  locale: "en_US",
  /** Почта поддержки: пока ящик Gmail (решение 17 в docs/PLAN.md). */
  supportEmail: "freudin.support@gmail.com",
} as const;
