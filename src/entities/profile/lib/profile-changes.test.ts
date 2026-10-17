import { describe, expect, it } from "vitest";
import type { ProfileInput } from "../model/schemas";
import { getEmptySettingsInput, getProfileChanges, rebaseProfileDraft } from "./profile-changes";

// Сохранённые значения — как их отдаёт toProfileInput: уже нормализованные
const saved: ProfileInput = {
  username: "anna",
  displayName: "Anna",
  bio: "Hello",
  socialLinks: [{ platform: "telegram", url: "https://t.me/anna", title: "", highlighted: false }],
  contactEmail: "",
  ...getEmptySettingsInput(),
  priceAmount: "60",
  currency: "USD",
};

describe("getProfileChanges", () => {
  it("без изменений — null", () => {
    expect(getProfileChanges(saved, { ...saved })).toBeNull();
  });

  it("та же ссылка в другой записи — не изменение", () => {
    const input = { ...saved, socialLinks: [{ ...saved.socialLinks[0], url: "@anna" }] };
    expect(getProfileChanges(saved, input)).toBeNull();
  });

  it("отправляет только изменённое поле", () => {
    expect(getProfileChanges(saved, { ...saved, bio: "  Hi  " })).toEqual({ bio: "Hi" });
  });

  it("связанные поля отправляет группой", () => {
    expect(getProfileChanges(saved, { ...saved, workFormats: ["online"] })).toEqual({
      country: "",
      cityId: null,
      workFormats: ["online"],
    });
    expect(getProfileChanges(saved, { ...saved, clientTypes: ["individuals"] })).toEqual({
      clientTypes: ["individuals"],
      concerns: [],
      services: [],
    });
    expect(getProfileChanges(saved, { ...saved, preferredContact: "https://t.me/anna" })).toEqual({
      socialLinks: [
        { platform: "telegram", url: "https://t.me/anna", title: "", highlighted: false },
      ],
      contacts: { email: "", phone: "", whatsapp: "", telegram: "" },
      preferredContact: "https://t.me/anna",
    });
  });

  it("цену и валюту отправляет по отдельности: их меняют в разных разделах", () => {
    expect(getProfileChanges(saved, { ...saved, priceAmount: "80" })).toEqual({
      priceAmount: "80",
    });
    expect(getProfileChanges(saved, { ...saved, currency: "GEL" })).toEqual({ currency: "GEL" });
  });

  it("неверные данные отправляет целиком, чтобы сервер ответил ошибками по полям", () => {
    const input = { ...saved, username: "ab" };
    expect(getProfileChanges(saved, input)).toBe(input);
  });
});

describe("rebaseProfileDraft", () => {
  // Другая вкладка сохранила цену 200; в этой форма открыта с ценой 150, правят только Bio
  const latest: ProfileInput = { ...saved, priceAmount: "200", concerns: ["anxiety"] };
  const base: ProfileInput = { ...saved, priceAmount: "150" };

  it("неизменённые поля берёт из свежих данных: старая цена не уходит как правка", () => {
    const draft = rebaseProfileDraft(base, { ...base, bio: "Hi" }, latest);
    expect(draft).toEqual({ ...latest, bio: "Hi" });
    expect(getProfileChanges(latest, draft)).toEqual({ bio: "Hi" });
  });

  it("изменённые в этой вкладке поля оставляет из черновика", () => {
    const draft = rebaseProfileDraft(base, { ...base, priceAmount: "180" }, latest);
    expect(draft.priceAmount).toBe("180");
    expect(draft.concerns).toEqual(["anxiety"]);
  });
});
