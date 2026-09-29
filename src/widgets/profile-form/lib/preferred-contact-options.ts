import {
  contactsSchema,
  contactTypeIds,
  contactTypeLabels,
  getContactCaption,
  type ProfileInput,
} from "@/entities/profile";
import { getSocialLinkCaption, socialLinkSchema } from "@/entities/social-link";

export type PreferredContactOption = { value: string; label: string };

/**
 * Варианты предпочтительного способа связи из того, что уже введено в форме: заполненные
 * контакты (`whatsapp`) и ссылки на соцсети (по нормализованному адресу). Неверно введённые
 * пропускаем: сохранить их всё равно не получится.
 */
export function getPreferredContactOptions(
  contacts: ProfileInput["contacts"],
  socialLinks: ProfileInput["socialLinks"],
): PreferredContactOption[] {
  const options: PreferredContactOption[] = [];
  for (const type of contactTypeIds) {
    const contact = contactsSchema.shape[type].safeParse(contacts[type]);
    if (contact.success && contact.data) {
      const caption = getContactCaption(type, contact.data);
      options.push({ value: type, label: `${contactTypeLabels[type]} · ${caption}` });
    }
  }
  for (const input of socialLinks) {
    const link = socialLinkSchema.safeParse(input);
    if (link.success && !options.some((option) => option.value === link.data.url)) {
      options.push({ value: link.data.url, label: getSocialLinkCaption(link.data) });
    }
  }
  return options;
}
