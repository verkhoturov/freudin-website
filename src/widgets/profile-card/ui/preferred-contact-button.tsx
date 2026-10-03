import type { ComponentProps } from "react";
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

export type ContactAction = { href: string; label: string; isExternal: boolean };

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
  // Ссылка может вести на канал или страницу, а не в личные сообщения: без своего заголовка
  // подпись говорит только, куда ведёт кнопка
  const label =
    link.title ||
    (link.platform === "website"
      ? "Visit website"
      : `Open ${socialPlatforms[link.platform].label}`);
  return { href: link.url, label, isExternal: true };
}

/** Действие предпочтительного способа связи: главная кнопка и кнопки в карточках услуг. */
export function getPreferredContactAction(profile: PublicProfile): ContactAction | null {
  return profile.preferredContact
    ? getContactAction(profile.preferredContact, profile.contacts, profile.socialLinks)
    : null;
}

type ContactActionButtonProps = Pick<
  ComponentProps<typeof Button>,
  "variant" | "size" | "className"
> & {
  action: ContactAction;
};

export function ContactActionButton({ action, ...buttonProps }: ContactActionButtonProps) {
  return (
    <Button asChild {...buttonProps}>
      <a
        href={action.href}
        {...(action.isExternal ? { target: "_blank", rel: "me noopener noreferrer" } : {})}>
        <span className="min-w-0 truncate">{action.label}</span>
      </a>
    </Button>
  );
}

/** Главная кнопка страницы: предпочтительный способ связи, который выбрал психолог. */
export function PreferredContactButton({ profile }: { profile: PublicProfile }) {
  const action = getPreferredContactAction(profile);
  return action ? <ContactActionButton action={action} size="lg" className="w-full" /> : null;
}
