import type { ComponentProps } from "react";
import { siteConfig } from "@/shared/config";

/** Ссылка `mailto:` на почту поддержки, текст — сам адрес. */
export function SupportEmailLink(props: Omit<ComponentProps<"a">, "href" | "children">) {
  return (
    <a href={`mailto:${siteConfig.supportEmail}`} {...props}>
      {siteConfig.supportEmail}
    </a>
  );
}
