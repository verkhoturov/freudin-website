import type { ContactType } from "../config/contacts";

/** Ссылка контакта: `mailto:`, `tel:`, `wa.me` или `t.me`. */
export function getContactHref(type: ContactType, value: string): string {
  const digits = value.replace(/\D/g, "");
  switch (type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:+${digits}`;
    case "whatsapp":
      return `https://wa.me/${digits}`;
    case "telegram":
      return value;
  }
}

/** Как показать контакт: номер и почта — как ввели, Telegram — `@username`. */
export function getContactCaption(type: ContactType, value: string): string {
  if (type !== "telegram") return value;
  try {
    const handle = new URL(value).pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : value;
  } catch {
    return value;
  }
}
