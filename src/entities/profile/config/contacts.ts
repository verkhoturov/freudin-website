/**
 * Контакты для связи на странице психолога. Хранятся в jsonb-колонке `profiles.contacts`
 * (только заполненные), БД проверяет только формат ключей, поэтому тип добавляется без миграции.
 */
export const contactTypeIds = ["email", "phone", "whatsapp", "telegram"] as const;

export type ContactType = (typeof contactTypeIds)[number];

export const contactTypeLabels: Record<ContactType, string> = {
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};

export function isContactType(value: string): value is ContactType {
  return (contactTypeIds as readonly string[]).includes(value);
}
