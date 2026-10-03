import { getCityLabel, getCountryName } from "@/entities/location";
import {
  approachLabels,
  clientTypeLabels,
  contactTypeIds,
  contactTypeLabels,
  formatExperience,
  formatPrice,
  getLanguageName,
  type ProfileSection,
  type PublicProfile,
  workFormatLabels,
} from "@/entities/profile";
import { getSocialLinkCaption } from "@/entities/social-link";

const NOT_FILLED = "Not filled";

function list(items: string[]): string {
  return items.length > 0 ? items.join(", ") : NOT_FILLED;
}

/**
 * Сводка свёрнутого блока: что в нём заполнено. `profile` — превью из значений формы
 * (`toPreviewProfile`), неверно введённое в него не попадает. Документы сохраняются вне формы,
 * их сводку даёт страница.
 */
export function getBlockSummary(
  section: Exclude<ProfileSection, "documents">,
  profile: PublicProfile,
): string {
  switch (section) {
    case "bio":
      return profile.bio || NOT_FILLED;
    case "experience":
      return profile.practiceStartedOn ? formatExperience(profile.practiceStartedOn) : NOT_FILLED;
    case "approaches":
      return list(profile.approaches.map((id) => approachLabels[id]));
    case "client-types":
      return list(profile.clientTypes.map((id) => clientTypeLabels[id]));
    case "work-formats":
      return list(profile.workFormats.map((id) => workFormatLabels[id]));
    case "location": {
      const { city, country } = profile;
      if (city) return `${getCityLabel(city)}, ${getCountryName(city.countryCode)}`;
      return country ? getCountryName(country) : NOT_FILLED;
    }
    case "languages":
      return list(profile.languages.map(getLanguageName));
    case "price":
      return profile.price ? `From ${formatPrice(profile.price)}` : NOT_FILLED;
    case "education":
      return list(profile.education.map((entry) => entry.qualification));
    case "contacts":
      return list(
        contactTypeIds
          .filter((type) => profile.contacts[type])
          .map((type) => contactTypeLabels[type]),
      );
    case "links":
      return list(profile.socialLinks.map(getSocialLinkCaption));
    case "faq":
      return list(profile.faq.map((item) => item.question));
    case "services":
      return list(profile.services.map((service) => service.title));
  }
}
