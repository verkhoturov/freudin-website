/**
 * Справочники данных психолога. Значения хранятся в `profiles` как есть, БД проверяет только
 * их формат (`^[a-z-]+$`), поэтому список можно менять без миграции. Убранное из списка значение
 * пропадёт со страницы при следующем чтении профиля.
 */

/** Подходы: распространённые в практике и с исследованиями эффективности (решение 20.2). */
export const approachIds = [
  "cbt",
  "act",
  "schema",
  "emdr",
  "psychodynamic",
  "psychoanalysis",
  "gestalt",
  "person-centered",
  "systemic-family",
  "emotion-focused",
  "dbt",
] as const;

export type Approach = (typeof approachIds)[number];

export const approachLabels: Record<Approach, string> = {
  cbt: "Cognitive behavioral therapy (CBT)",
  act: "Acceptance and commitment therapy (ACT)",
  schema: "Schema therapy",
  emdr: "EMDR",
  psychodynamic: "Psychodynamic therapy",
  psychoanalysis: "Psychoanalysis",
  gestalt: "Gestalt therapy",
  "person-centered": "Person-centered therapy",
  "systemic-family": "Systemic family therapy",
  "emotion-focused": "Emotion-focused therapy (EFT)",
  dbt: "Dialectical behavior therapy (DBT)",
};

/** С кем работает психолог. */
export const clientTypeIds = ["individuals", "couples", "children", "teens", "groups"] as const;

export type ClientType = (typeof clientTypeIds)[number];

export const clientTypeLabels: Record<ClientType, string> = {
  individuals: "Individuals",
  couples: "Couples",
  children: "Children",
  teens: "Teens",
  groups: "Groups",
};

/** Формат работы. Для очного приёма нужен город. */
export const workFormatIds = ["online", "in-person"] as const;

export type WorkFormat = (typeof workFormatIds)[number];

export const workFormatLabels: Record<WorkFormat, string> = {
  online: "Online",
  "in-person": "In person",
};

/** Общая цена сессии: «от» (прежнее значение) или фиксированная. */
export const priceTypeIds = ["from", "fixed"] as const;

export type PriceType = (typeof priceTypeIds)[number];

/** Приём новых клиентов, как его заявил психолог. Не указан — на странице ничего нет. */
export const acceptingClientsIds = ["accepting", "waitlist", "not-accepting"] as const;

export type AcceptingClients = (typeof acceptingClientsIds)[number];

export const acceptingClientsLabels: Record<AcceptingClients, string> = {
  accepting: "Accepting new clients",
  waitlist: "Waitlist for new clients",
  "not-accepting": "Not accepting new clients",
};
