import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("календарные границы", () => {
    afterEach(() => vi.useRealTimers());

    it.each([
      { today: "2026-10-15", adult: "2008-10-15", underage: "2008-10-16", tomorrow: "2026-10-16" },
      { today: "2028-02-29", adult: "2010-02-28", underage: "2010-03-01", tomorrow: "2028-03-01" },
      { today: "2028-03-01", adult: "2010-03-01", underage: "2010-03-02", tomorrow: "2028-03-02" },
      { today: "2026-02-28", adult: "2008-02-28", underage: "2008-02-29", tomorrow: "2026-03-01" },
    ])("проверяет 18 лет и начало практики на $today", ({ today, adult, underage, tomorrow }) => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date(`${today}T12:00:00Z`));

      expect(issuePaths(input({ birthDate: adult }))).toEqual([]);
      expect(issuePaths(input({ birthDate: underage }))).toEqual(["birthDate"]);
      expect(issuePaths(input({ birthDate: "2000-02-30" }))).toEqual(["birthDate"]);
      expect(issuePaths(input({ practiceStartedOn: today }))).toEqual([]);
      expect(issuePaths(input({ practiceStartedOn: tomorrow }))).toEqual(["practiceStartedOn"]);
    });
  });

  it("роль и район — до 60 и 100 символов, статус приёма — из справочника или пустой", () => {
    expect(
      issuePaths(input({ professionalRole: "x".repeat(60), inPersonArea: "x".repeat(100) })),
    ).toEqual([]);
    expect(
      issuePaths(input({ professionalRole: "x".repeat(61), inPersonArea: "x".repeat(101) })),
    ).toEqual(["professionalRole", "inPersonArea"]);
    expect(issuePaths(input({ acceptingClients: "" }))).toEqual([]);
    expect(issuePaths(input({ priceType: "fixed", acceptingClients: "not-accepting" }))).toEqual(
      [],
    );
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
  const parseUpdate = (fields: object) =>
    profileUpdateSchema.safeParse({ expectedVersion: 1, ...fields });

  it("требует версию, с которой открыта форма", () => {
    const result = profileUpdateSchema.safeParse({ bio: "Hello" });
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["expectedVersion"]);
    expect(parseUpdate({ expectedVersion: 0 }).success).toBe(false);
  });

  it("принимает отдельные несвязанные поля", () => {
    expect(parseUpdate({ bio: "Hello" }).success).toBe(true);
  });

  it("требует связанные поля группой", () => {
    const result = parseUpdate({ workFormats: ["online"] });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "country",
      "cityId",
    ]);
    // Цена и валюта не связаны: валюту меняют в Account, цену — в Public profile
    expect(parseUpdate({ priceAmount: "50" }).success).toBe(true);
    expect(parseUpdate({ currency: "GEL" }).success).toBe(true);

    const visibility = parseUpdate({ visibility: "password" });
    expect(visibility.error?.issues.map((issue) => issue.path.join("."))).toEqual(["pagePassword"]);
  });

  it("проверяет согласованность переданной группы", () => {
    const location = { country: "GE", cityId: 611717, workFormats: ["in-person"] } as const;
    expect(parseUpdate({ ...location, workFormats: [...location.workFormats] }).success).toBe(true);
    expect(parseUpdate({ ...location, cityId: null, workFormats: ["in-person"] }).success).toBe(
      false,
    );
  });
});
