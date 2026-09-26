import { Button } from "@/shared/ui/button";
import { getSocialLinkCaption } from "../lib/get-social-link-caption";
import type { SocialLink } from "../model/schema";

export function SocialLinkButton({ link }: { link: SocialLink }) {
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      {/* rel="me": ссылка ведёт на другой профиль того же человека */}
      <a href={link.url} target="_blank" rel="me noopener noreferrer">
        <span className="min-w-0 truncate">{getSocialLinkCaption(link)}</span>
      </a>
    </Button>
  );
}
