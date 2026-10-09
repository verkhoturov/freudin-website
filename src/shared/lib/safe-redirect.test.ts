import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./safe-redirect";

describe("getSafeRedirectPath", () => {
  it("пропускает путь внутри сайта", () => {
    expect(getSafeRedirectPath("/settings?section=account#block-bio")).toBe(
      "/settings?section=account#block-bio",
    );
  });

  it.each([
    null,
    undefined,
    "",
    "settings",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/ evil",
    "/\u007f",
  ])("заменяет %j на fallback", (value) => {
    expect(getSafeRedirectPath(value, "/home")).toBe("/home");
  });

  it("по умолчанию отправляет на главную", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/");
  });
});
