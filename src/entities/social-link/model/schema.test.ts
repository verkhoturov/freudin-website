import { describe, expect, it } from "vitest";
import { normalizeSocialLinkUrl } from "./normalize";
import { socialLinkSchema } from "./schema";

describe("normalizeSocialLinkUrl", () => {
  it.each([
    ["telegram", "@anna", "https://t.me/anna"],
    ["telegram", "anna.smith", "https://t.me/anna.smith"],
    ["telegram", "t.me/anna", "https://t.me/anna"],
    ["telegram", "http://telegram.me/anna", "https://telegram.me/anna"],
    ["instagram", " @anna ", "https://www.instagram.com/anna"],
    ["instagram", "https://m.instagram.com/anna/", "https://m.instagram.com/anna/"],
    ["youtube", "@channel", "https://www.youtube.com/@channel"],
    ["linkedin", "anna-smith", "https://www.linkedin.com/in/anna-smith"],
    ["website", "example.com", "https://example.com/"],
    ["website", "http://example.com/blog", "http://example.com/blog"],
  ] as const)("%s: %j → %s", (platform, input, expected) => {
    expect(normalizeSocialLinkUrl(platform, input)).toBe(expected);
  });

  it.each([
    ["telegram", ""],
    ["telegram", "https://evil.com/anna"],
    // Домен, который только оканчивается на домен платформы
    ["telegram", "https://notat.me/anna"],
    ["instagram", "https://instagram.com/"],
    ["instagram", "javascript:alert(1)"],
    ["website", "localhost"],
    ["website", "ftp://example.com"],
    ["website", "anna"],
  ] as const)("%s: отклоняет %j", (platform, input) => {
    expect(normalizeSocialLinkUrl(platform, input)).toBeNull();
  });
});

describe("socialLinkSchema", () => {
  it("нормализует адрес и заполняет поля по умолчанию у старых ссылок", () => {
    expect(socialLinkSchema.parse({ platform: "telegram", url: "@anna" })).toEqual({
      platform: "telegram",
      url: "https://t.me/anna",
      title: "",
      highlighted: false,
    });
  });

  it("обрезает пробелы в заголовке и ограничивает его длину", () => {
    const link = { platform: "website", url: "example.com", highlighted: true } as const;
    expect(socialLinkSchema.parse({ ...link, title: "  Articles  " }).title).toBe("Articles");
    expect(socialLinkSchema.safeParse({ ...link, title: "a".repeat(40) }).success).toBe(true);
    expect(socialLinkSchema.safeParse({ ...link, title: "a".repeat(41) }).success).toBe(false);
  });

  it("ставит ошибку чужой ссылки на поле url", () => {
    const result = socialLinkSchema.safeParse({ platform: "x", url: "https://example.com/anna" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["url"]);
  });
});
