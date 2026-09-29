import {
  getContactHref,
  isContactType,
  type ProfileContacts,
  type PublicProfile,
} from "@/entities/profile";
import { type SocialLink, socialPlatforms } from "@/entities/social-link";
import { Button } from "@/shared/ui/button";

const contactActionLabels = {
  email: "Send an email",
  phone: "Call",
  whatsapp: "Message on WhatsApp",
  telegram: "Message on Telegram",
} as const;

type ContactAction = { href: string; label: string; isExternal: boolean };

function getContactAction(
  preferred: string,
  contacts: ProfileContacts,
  socialLinks: SocialLink[],
): ContactAction | null {
  if (isContactType(preferred)) {
    const value = contacts[preferred];
    if (!value) return null;
    const href = getContactHref(preferred, value);
    return { href, label: contactActionLabels[preferred], isExternal: href.startsWith("https:") };
  }
  const link = socialLinks.find((item) => item.url === preferred);
  if (!link) return null;
  const label =
    link.platform === "website"
      ? "Visit website"
      : `Message on ${socialPlatforms[link.platform].label}`;
  return { href: link.url, label, isExternal: true };
}

/** Главная кнопка страницы: предпочтительный способ связи, который выбрал психолог. */
export function PreferredContactButton({ profile }: { profile: PublicProfile }) {
  const action = profile.preferredContact
    ? getContactAction(profile.preferredContact, profile.contacts, profile.socialLinks)
    : null;
  if (!action) return null;

  return (
    <Button asChild size="lg" className="w-full">
      <a
        href={action.href}
        {...(action.isExternal ? { target: "_blank", rel: "me noopener noreferrer" } : {})}>
        {action.label}
      </a>
    </Button>
  );
}
