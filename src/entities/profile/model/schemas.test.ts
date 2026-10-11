import { describe, expect, it } from "vitest";
import { getEmptySettingsInput } from "../lib/profile-changes";
import { type ProfileInput, profileInputSchema, profileUpdateSchema } from "./schemas";

function input(overrides: Partial<ProfileInput> = {}): ProfileInput {
  return {
    username: "anna",
    displayName: "Anna",
    bio: "",
    socialLinks: [],
    contactEmail: "",
    ...getEmptySettingsInput(),
    ...overrides,
  };
}

const service = {
  clientType: "couples",
  title: "Couples session",
  description: "",
  durationMinutes: "90",
  priceAmount: "",
  highlighted: false,
} as const;

// Дата `YYYY-MM-DD` по UTC со сдвигом в годах и днях от сегодня
function utcDate(years: number, days = 0): string {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + years, date.getUTCMonth(), date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function issuePaths(value: ProfileInput): string[] {
  const result = profileInputSchema.safeParse(value);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("profileInputSchema", () => {
  it("принимает минимальный профиль онбординга", () => {
    expect(issuePaths(input())).toEqual([]);
  });

  it("очному формату нужен город, городу — страна", () => {
    expect(issuePaths(input({ workFormats: ["in-person"] }))).toEqual(["cityId"]);
    expect(issuePaths(input({ cityId: 611717 }))).toEqual(["cityId"]);
    expect(
      issuePaths(input({ country: "GE", cityId: 611717, workFormats: ["in-person"] })),
    ).toEqual([]);
  });

  it("цена сессии — целая сумма без ведущих нулей, валюта — общая для профиля", () => {
    expect(issuePaths(input({ priceAmount: "60" }))).toEqual([]);
    expect(issuePaths(input({ priceAmount: "1.5" }))).toEqual(["priceAmount"]);
    expect(issuePaths(input({ priceAmount: "0" }))).toEqual(["priceAmount"]);
    const data = profileInputSchema.parse(input({ priceAmount: " 060 " }));
    expect(data.priceAmount).toBe("60");
  });

  it("валюта профиля обязательна и берётся из справочника", () => {
    expect(issuePaths(input({ currency: "GEL" }))).toEqual([]);
    expect(issuePaths(input({ currency: "" }))).toEqual(["currency"]);
    expect(issuePaths(input({ currency: "usd" }))).toEqual(["currency"]);
  });

  it("хранит списки без порядка в порядке справочника", () => {
    const data = profileInputSchema.parse(
      input({ clientTypes: ["groups", "individuals"], highlightedSections: ["faq", "bio"] }),
    );
    expect(data.clientTypes).toEqual(["individuals", "groups"]);
    expect(data.highlightedSections).toEqual(["bio", "faq"]);
  });

  it("не удаляет карточку услуги снятой категории, а ставит ошибку у неё", () => {
    expect(
      issuePaths(input({ clientTypes: ["individuals", "couples"], services: [service] })),
    ).toEqual([]);
    expect(issuePaths(input({ clientTypes: ["individuals"], services: [service] }))).toEqual([
      "services.0.clientType",
    ]);
  });

  it("у карточки услуги — только сумма: валюта общая для профиля", () => {
    const services = [{ ...service, priceAmount: "100" }];
    expect(issuePaths(input({ clientTypes: ["couples"], services }))).toEqual([]);
    expect(
      issuePaths(input({ clientTypes: ["couples"], services: [{ ...service, priceAmount: "x" }] })),
    ).toEqual(["services.0.priceAmount"]);
  });

  it("отбрасывает запросы пар без Couples и детские без Children или Teens", () => {
    const concerns = ["stress", "couple-divorce"] as const;
    expect(profileInputSchema.parse(input({ concerns: [...concerns] })).concerns).toEqual([
      "stress",
    ]);
    expect(
      profileInputSchema.parse(input({ clientTypes: ["couples"], concerns: [...concerns] }))
        .concerns,
    ).toEqual(["stress", "couple-divorce"]);
  });

  it("сбрасывает способ связи, которого больше нет", () => {
    const link = { platform: "telegram", url: "@anna", title: "", highlighted: false } as const;
    const contacts = { email: "", phone: "", whatsapp: "+995 555 12 34 56", telegram: "" };

    const kept = profileInputSchema.parse(
      input({ socialLinks: [link], contacts, preferredContact: "https://t.me/anna" }),
    );
    expect(kept.preferredContact).toBe("https://t.me/anna");
    expect(
      profileInputSchema.parse(input({ contacts, preferredContact: "whatsapp" })).preferredContact,
    ).toBe("whatsapp");

    expect(
      profileInputSchema.parse(input({ preferredContact: "https://t.me/anna" })).preferredContact,
    ).toBe("");
    expect(profileInputSchema.parse(input({ preferredContact: "phone" })).preferredContact).toBe(
      "",
    );
  });

  it("нормализует контакты и отклоняет телефон без кода страны", () => {
    const data = profileInputSchema.parse(
      input({
        contacts: { email: "", phone: "+995  555 12 34 56", whatsapp: "", telegram: "@anna" },
      }),
    );
    expect(data.contacts).toMatchObject({
      phone: "+995 555 12 34 56",
      telegram: "https://t.me/anna",
    });
    expect(
      issuePaths(
        input({ contacts: { email: "", phone: "555 12 34", whatsapp: "", telegram: "" } }),
      ),
    ).toEqual(["contacts.phone"]);
  });

  it("режиму password нужен пароль из 4–8 символов, пробелы — часть пароля", () => {
    expect(issuePaths(input({ visibility: "password" }))).toEqual(["pagePassword"]);
    expect(issuePaths(input({ visibility: "password", pagePassword: "abc" }))).toEqual([
      "pagePassword",
    ]);
    expect(issuePaths(input({ visibility: "password", pagePassword: "123456789" }))).toEqual([
      "pagePassword",
    ]);
    expect(issuePaths(input({ visibility: "password", pagePassword: " ab " }))).toEqual([]);
    expect(issuePaths(input({ visibility: "private" }))).toEqual([]);
  });

  it("психологу не меньше 18 лет, практика не начинается в будущем", () => {
    expect(issuePaths(input({ birthDate: utcDate(-18) }))).toEqual([]);
    expect(issuePaths(input({ birthDate: utcDate(-18, 1) }))).toEqual(["birthDate"]);
    expect(issuePaths(input({ birthDate: "2000-02-30" }))).toEqual(["birthDate"]);
    expect(issuePaths(input({ practiceStartedOn: utcDate(0) }))).toEqual([]);
    expect(issuePaths(input({ practiceStartedOn: utcDate(0, 1) }))).toEqual(["practiceStartedOn"]);
  });

  it("ссылки не повторяются даже в разной записи", () => {
    const socialLinks = [
      { platform: "telegram", url: "@anna", title: "", highlighted: false },
      { platform: "telegram", url: "t.me/anna", title: "", highlighted: false },
    ] as const;
    expect(issuePaths(input({ socialLinks: [...socialLinks] }))).toEqual(["socialLinks"]);
  });
});

describe("profileUpdateSchema", () => {
  it("принимает отдельные несвязанные поля", () => {
    expect(profileUpdateSchema.safeParse({ bio: "Hello" }).success).toBe(true);
  });

  it("требует связанные поля группой", () => {
    const result = profileUpdateSchema.safeParse({ workFormats: ["online"] });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "country",
      "cityId",
    ]);
    // Цена и валюта не связаны: валюту меняют в Account, цену — в Public profile
    expect(profileUpdateSchema.safeParse({ priceAmount: "50" }).success).toBe(true);
    expect(profileUpdateSchema.safeParse({ currency: "GEL" }).success).toBe(true);

    const visibility = profileUpdateSchema.safeParse({ visibility: "password" });
    expect(visibility.error?.issues.map((issue) => issue.path.join("."))).toEqual(["pagePassword"]);
  });

  it("проверяет согласованность переданной группы", () => {
    const location = { country: "GE", cityId: 611717, workFormats: ["in-person"] } as const;
    expect(
      profileUpdateSchema.safeParse({ ...location, workFormats: [...location.workFormats] })
        .success,
    ).toBe(true);
    expect(
      profileUpdateSchema.safeParse({ ...location, cityId: null, workFormats: ["in-person"] })
        .success,
    ).toBe(false);
  });
});
