import { Button } from "@/shared/ui/button";
import { socialPlatforms } from "../config/platforms";
import type { SocialLink } from "../model/schema";

export function SocialLinkButton({ link }: { link: SocialLink }) {
  return (
    <Button asChild variant="outline" size="lg" className="w-full">
      {/* rel="me": ссылка ведёт на другой профиль того же человека */}
      <a href={link.url} target="_blank" rel="me noopener noreferrer">
        {socialPlatforms[link.platform].label}
      </a>
    </Button>
  );
}
