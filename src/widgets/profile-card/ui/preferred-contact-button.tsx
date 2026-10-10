import { Mail, Phone } from "lucide-react";
import type { ComponentProps } from "react";
import {
  type ContactType,
  getContactHref,
  isContactType,
  type ProfileContacts,
  type PublicProfile,
} from "@/entities/profile";
import {
  PlatformIcon,
  type SocialLink,
  type SocialPlatform,
  socialPlatforms,
} from "@/entities/social-link";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const contactActionLabels = {
  email: "Send an email",
  phone: "Call",
  whatsapp: "Message on WhatsApp",
  telegram: "Message on Telegram",
} as const;

export type ContactAction = {
  href: string;
  label: string;
  isExternal: boolean;
  /** Куда ведёт кнопка: по нему выбирается иконка. */
  target: ContactType | SocialPlatform;
};

function getContactAction(
  preferred: string,
  contacts: ProfileContacts,
  socialLinks: SocialLink[],
): ContactAction | null {
  if (isContactType(preferred)) {
    const value = contacts[preferred];
    if (!value) return null;
    const href = getContactHref(preferred, value);
    return {
      href,
      label: contactActionLabels[preferred],
      isExternal: href.startsWith("https:"),
      target: preferred,
    };
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
  return { href: link.url, label, isExternal: true, target: link.platform };
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
  /** Иконка способа связи перед подписью. */
  showIcon?: boolean;
};

function ContactActionIcon({ target }: { target: ContactAction["target"] }) {
  if (target === "email") return <Mail aria-hidden="true" />;
  if (target === "phone") return <Phone aria-hidden="true" />;
  return <PlatformIcon platform={target} />;
}

export function ContactActionButton({
  action,
  showIcon = false,
  ...buttonProps
}: ContactActionButtonProps) {
  return (
    <Button asChild {...buttonProps}>
      <a
        href={action.href}
        {...(action.isExternal ? { target: "_blank", rel: "me noopener noreferrer" } : {})}>
        {showIcon ? <ContactActionIcon target={action.target} /> : null}
        <span className="min-w-0 truncate">{action.label}</span>
      </a>
    </Button>
  );
}

/** Главная кнопка страницы: предпочтительный способ связи, который выбрал психолог. */
export function PreferredContactButton({
  profile,
  className,
}: {
  profile: PublicProfile;
  className?: string;
}) {
  const action = getPreferredContactAction(profile);
  return action ? (
    <ContactActionButton
      action={action}
      showIcon={profile.linkIcons}
      size="lg"
      className={cn("w-full", className)}
    />
  ) : null;
}
