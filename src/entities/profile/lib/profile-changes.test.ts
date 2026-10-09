import { describe, expect, it } from "vitest";
import type { ProfileInput } from "../model/schemas";
import { getEmptySettingsInput, getProfileChanges } from "./profile-changes";

// Сохранённые значения — как их отдаёт toProfileInput: уже нормализованные
const saved: ProfileInput = {
  username: "anna",
  displayName: "Anna",
  bio: "Hello",
  socialLinks: [{ platform: "telegram", url: "https://t.me/anna", title: "", highlighted: false }],
  contactEmail: "",
  ...getEmptySettingsInput(),
  priceAmount: "60",
  priceCurrency: "USD",
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
    expect(getProfileChanges(saved, { ...saved, priceAmount: "80" })).toEqual({
      priceAmount: "80",
      priceCurrency: "USD",
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

  it("неверные данные отправляет целиком, чтобы сервер ответил ошибками по полям", () => {
    const input = { ...saved, username: "ab" };
    expect(getProfileChanges(saved, input)).toBe(input);
  });
});
