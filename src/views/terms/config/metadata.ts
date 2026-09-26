import type { Metadata } from "next";
import { routes } from "@/shared/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your access to and use of Freudin.",
  alternates: { canonical: routes.terms },
};
