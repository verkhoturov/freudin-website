import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Создание страницы",
  // Служебная страница: в поиск не попадает, но ссылки с неё учитываются
  robots: { index: false, follow: true },
};
