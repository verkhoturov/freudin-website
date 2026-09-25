import type { Metadata } from "next";
import { routes } from "@/shared/config";

export const metadata: Metadata = {
  alternates: { canonical: routes.home },
};
