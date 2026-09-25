import type { Metadata } from "next";
import { routes } from "@/shared/config";

export const metadata: Metadata = {
  title: "Условия использования",
  alternates: { canonical: routes.terms },
};
