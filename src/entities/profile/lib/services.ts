import type { ProfileData, ProfileInput } from "../model/schemas";
import type { ProfileService } from "../model/types";

/** Карточка после схемы формы → как на странице и в БД: числа числами, цена объектом. */
export function toProfileService(service: ProfileData["services"][number]): ProfileService {
  const { clientType, title, description, durationMinutes, priceAmount, priceCurrency } = service;
  return {
    clientType,
    title,
    description,
    durationMinutes: durationMinutes ? Number(durationMinutes) : null,
    price: priceAmount ? { amount: Number(priceAmount), currency: priceCurrency } : null,
    highlighted: service.highlighted,
  };
}

/** Карточка со страницы → значения формы. Порядок ключей — как в схеме: формы сравнивают JSON. */
export function toServiceInput(service: ProfileService): ProfileInput["services"][number] {
  return {
    clientType: service.clientType,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes === null ? "" : String(service.durationMinutes),
    priceAmount: service.price ? String(service.price.amount) : "",
    priceCurrency: service.price?.currency ?? "",
    highlighted: service.highlighted,
  };
}
