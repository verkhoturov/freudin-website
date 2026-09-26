import type { Metadata } from "next";
import { routes } from "@/shared/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Freudin collects, uses, stores, and protects personal data.",
  alternates: { canonical: routes.privacy },
};
