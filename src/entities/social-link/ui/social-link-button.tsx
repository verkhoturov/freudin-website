import { Button } from "@/shared/ui/button";
import { getSocialLinkCaption } from "../lib/get-social-link-caption";
import type { SocialLink } from "../model/schema";
import { PlatformIcon } from "./platform-icon";

type SocialLinkButtonProps = {
  link: SocialLink;
  /** Логотип платформы перед подписью. */
  showIcon?: boolean;
};

export function SocialLinkButton({ link, showIcon = false }: SocialLinkButtonProps) {
  return (
    <Button
      asChild
      variant={link.highlighted ? "secondary" : "outline"}
      size="lg"
      className="w-full">
      {/* rel="me": ссылка ведёт на другой профиль того же человека */}
      <a href={link.url} target="_blank" rel="me noopener noreferrer">
        {showIcon ? <PlatformIcon platform={link.platform} /> : null}
        <span className="min-w-0 truncate">{getSocialLinkCaption(link)}</span>
      </a>
    </Button>
  );
}
