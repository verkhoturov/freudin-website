import type { ReactNode } from "react";
import { getCityLabel, getCountryName } from "@/entities/location";
import {
  approachLabels,
  clientTypeLabels,
  contactTypeIds,
  contactTypeLabels,
  formatExperience,
  formatPrice,
  getContactCaption,
  getContactHref,
  getLanguageName,
  type ProfileSection,
  type PublicProfile,
  profileSectionLabels,
  workFormatLabels,
} from "@/entities/profile";

/** Блоки с данными практики: на странице это пункты списка `dl`. */
export type PracticeSection = Exclude<
  ProfileSection,
  "bio" | "links" | "documents" | "faq" | "services"
>;

export type PracticeItem = { section: PracticeSection; details: ReactNode };

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** «Individuals and couples»: с заглавной только первое слово. */
function toSentenceList(labels: string[]): string {
  return listFormat.format(
    labels.map((label, index) => (index === 0 ? label : label.toLowerCase())),
  );
}

/** Значение пункта практики или `null`, если он не заполнен. */
export function getPracticeDetails(profile: PublicProfile, section: PracticeSection): ReactNode {
  const { approaches, clientTypes, workFormats, city, country, languages, price } = profile;
  switch (section) {
    case "experience":
      return profile.practiceStartedOn ? formatExperience(profile.practiceStartedOn) : null;
    case "approaches":
      return approaches.length > 0 ? (
        <ul>
          {approaches.map((approach) => (
            <li key={approach}>{approachLabels[approach]}</li>
          ))}
        </ul>
      ) : null;
    case "client-types":
      return clientTypes.length > 0
        ? toSentenceList(clientTypes.map((type) => clientTypeLabels[type]))
        : null;
    case "work-formats":
      return workFormats.length > 0
        ? toSentenceList(workFormats.map((format) => workFormatLabels[format]))
        : null;
    case "location":
      if (city) return `${getCityLabel(city)}, ${getCountryName(city.countryCode)}`;
      return country ? getCountryName(country) : null;
    case "languages":
      return languages.length > 0 ? listFormat.format(languages.map(getLanguageName)) : null;
    case "price":
      return price ? `From ${formatPrice(price)} per session` : null;
    case "education":
      return profile.education.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {profile.education.map((entry, index) => (
            // Записи не уникальны и не переставляются
            // biome-ignore lint/suspicious/noArrayIndexKey: список только для чтения
            <li key={index}>
              {entry.qualification}
              <br />
              <span className="text-muted-foreground">
                {entry.institution}
                {entry.year ? `, ${entry.year}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null;
    case "contacts": {
      const contacts = contactTypeIds.flatMap((type) => {
        const value = profile.contacts[type];
        return value ? [{ type, value }] : [];
      });
      return contacts.length > 0 ? (
        <ul>
          {contacts.map(({ type, value }) => (
            <li key={type}>
              {contactTypeLabels[type]}:{" "}
              <a
                href={getContactHref(type, value)}
                className="text-link underline underline-offset-4">
                {getContactCaption(type, value)}
              </a>
            </li>
          ))}
        </ul>
      ) : null;
    }
  }
}

/** Идущие подряд пункты практики одним списком. */
export function PracticeDetails({ items }: { items: PracticeItem[] }) {
  return (
    <dl className="flex w-full flex-col gap-4">
      {items.map(({ section, details }) => (
        <div key={section} className="flex flex-col gap-1">
          <dt className="text-muted-foreground text-sm">{profileSectionLabels[section]}</dt>
          <dd className="break-words">{details}</dd>
        </div>
      ))}
    </dl>
  );
}
