import type { Metadata } from "next";
import { routes } from "@/shared/config";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  alternates: { canonical: routes.privacy },
};
