import type { ReactNode } from "react";
import { getCityLabel, getCountryName } from "@/entities/location";
import {
  approachLabels,
  clientTypeLabels,
  formatPrice,
  getLanguageName,
  type PublicProfile,
  workFormatLabels,
} from "@/entities/profile";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

/** «Individuals and couples»: с заглавной только первое слово. */
function toSentenceList(labels: string[]): string {
  return listFormat.format(
    labels.map((label, index) => (index === 0 ? label : label.toLowerCase())),
  );
}

function getLocation({ city, country }: PublicProfile): string | null {
  if (city) return `${getCityLabel(city)}, ${getCountryName(city.countryCode)}`;
  return country ? getCountryName(country) : null;
}

type PracticeDetailsProps = { profile: PublicProfile };

/** Данные практики психолога. Незаполненные пункты не показываем, пустой профиль — без блока. */
export function PracticeDetails({ profile }: PracticeDetailsProps) {
  const { approaches, clientTypes, workFormats, languages, price } = profile;
  const location = getLocation(profile);
  const items: { term: string; details: ReactNode }[] = [];

  if (approaches.length > 0) {
    items.push({
      term: "Approaches",
      details: (
        <ul>
          {approaches.map((approach) => (
            <li key={approach}>{approachLabels[approach]}</li>
          ))}
        </ul>
      ),
    });
  }
  if (clientTypes.length > 0) {
    const labels = clientTypes.map((type) => clientTypeLabels[type]);
    items.push({ term: "Works with", details: toSentenceList(labels) });
  }
  if (workFormats.length > 0) {
    const labels = workFormats.map((format) => workFormatLabels[format]);
    items.push({ term: "Format", details: toSentenceList(labels) });
  }
  if (location) items.push({ term: "Location", details: location });
  if (languages.length > 0) {
    items.push({ term: "Languages", details: listFormat.format(languages.map(getLanguageName)) });
  }
  if (price) items.push({ term: "Price", details: `From ${formatPrice(price)} per session` });

  if (items.length === 0) return null;

  return (
    <dl className="flex w-full flex-col gap-4">
      {items.map(({ term, details }) => (
        <div key={term} className="flex flex-col gap-1">
          <dt className="text-muted-foreground text-sm">{term}</dt>
          <dd className="break-words">{details}</dd>
        </div>
      ))}
    </dl>
  );
}
