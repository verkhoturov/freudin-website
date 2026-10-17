import { describe, expect, it } from "vitest";
import type { ProfileInput } from "../model/schemas";
import { toPreviewProfile } from "./preview-profile";
import { getEmptySettingsInput } from "./profile-changes";

const tbilisi = { id: 611717, name: "Tbilisi", region: "Tbilisi", countryCode: "GE" };

const input: ProfileInput = {
  username: " Anna ",
  displayName: "Anna",
  bio: "Hello",
  socialLinks: [
    { platform: "telegram", url: "@anna", title: "", highlighted: false },
    { platform: "instagram", url: "https://example.com/anna", title: "", highlighted: false },
  ],
  contactEmail: "private@example.com",
  ...getEmptySettingsInput(),
  country: "GE",
  cityId: tbilisi.id,
  clientTypes: ["individuals"],
  contacts: { email: "", phone: "not a phone", whatsapp: "+995 555 12 34 56", telegram: "" },
  preferredContact: "phone",
  services: [
    {
      clientType: "couples",
      title: "Couples session",
      description: "",
      durationMinutes: "",
      priceAmount: "",
      highlighted: false,
    },
  ],
  pagePassword: "secret",
  birthDate: "1990-01-01",
  gender: "female",
  concerns: ["stress"],
};

describe("toPreviewProfile", () => {
  const preview = toPreviewProfile(input, { avatarUrl: null, city: tbilisi });

  it("не показывает закрытые данные", () => {
    const json = JSON.stringify(preview);
    for (const key of ["contactEmail", "pagePassword", "birthDate", "gender", "concerns"]) {
      expect(preview).not.toHaveProperty(key);
    }
    expect(json).not.toContain("private@example.com");
    expect(json).not.toContain("secret");
    expect(json).not.toContain("1990-01-01");
  });

  it("отбрасывает неверно введённые поля, как не попали бы они на страницу", () => {
    expect(preview.username).toBe("anna");
    expect(preview.socialLinks.map((link) => link.url)).toEqual(["https://t.me/anna"]);
    expect(preview.contacts).toEqual({ whatsapp: "+995 555 12 34 56" });
    // Телефон неверный — главной кнопки нет
    expect(preview.preferredContact).toBeNull();
    // Карточка для категории, которой нет в Works with
    expect(preview.services).toEqual([]);
  });

  it("цены сессии и карточек — в валюте профиля", () => {
    const service = { ...input.services[0], clientType: "individuals", priceAmount: "90" } as const;
    const priced = toPreviewProfile(
      { ...input, currency: "GEL", priceAmount: "60", services: [service] },
      { avatarUrl: null, city: tbilisi },
    );
    expect(priced.currency).toBe("GEL");
    expect(priced.price).toEqual({ amount: 60, currency: "GEL" });
    expect(priced.services.map((item) => item.price)).toEqual([{ amount: 90, currency: "GEL" }]);
  });

  it("роль, тип цены, статус приёма и район — как на странице; пустой статус — не указан", () => {
    expect(preview).toMatchObject({
      professionalRole: "",
      priceType: "from",
      acceptingClients: null,
      inPersonArea: "",
    });
    const filled = toPreviewProfile(
      {
        ...input,
        professionalRole: " Clinical psychologist ",
        priceType: "fixed",
        acceptingClients: "waitlist",
        inPersonArea: "x".repeat(101),
      },
      { avatarUrl: null, city: tbilisi },
    );
    expect(filled).toMatchObject({
      professionalRole: "Clinical psychologist",
      priceType: "fixed",
      acceptingClients: "waitlist",
      // Длиннее предела — как неверно введённое поле, в превью не попадает
      inPersonArea: "",
    });
  });

  it("берёт город, только если он совпадает с выбранным и страна указана", () => {
    expect(preview.city).toEqual(tbilisi);
    expect(
      toPreviewProfile({ ...input, cityId: 1 }, { avatarUrl: null, city: tbilisi }).city,
    ).toBeNull();
    expect(
      toPreviewProfile({ ...input, country: "" }, { avatarUrl: null, city: tbilisi }).city,
    ).toBeNull();
  });
});
