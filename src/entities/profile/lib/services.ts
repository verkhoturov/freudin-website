import type { ProfileData, ProfileInput, StoredService } from "../model/schemas";
import type { ProfileService } from "../model/types";

/** Карточка после схемы формы → запись jsonb-колонки: числа числами, цена — только суммой. */
export function toStoredService(service: ProfileData["services"][number]): StoredService {
  const { clientType, title, description, durationMinutes, priceAmount } = service;
  return {
    clientType,
    title,
    description,
    durationMinutes: durationMinutes ? Number(durationMinutes) : null,
    price: priceAmount ? { amount: Number(priceAmount) } : null,
    highlighted: service.highlighted,
  };
}

/** Запись из БД → карточка страницы: цена в валюте профиля. */
export function toProfileService(service: StoredService, currency: string): ProfileService {
  return {
    ...service,
    price: service.price ? { amount: service.price.amount, currency } : null,
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
    highlighted: service.highlighted,
  };
}
