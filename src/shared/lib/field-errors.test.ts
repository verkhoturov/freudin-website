import { describe, expect, it } from "vitest";
import { toFieldErrors, toFormFieldName } from "./field-errors";

describe("toFormFieldName", () => {
  it.each([
    ["username", "username"],
    ["socialLinks.0.url", "socialLinks[0].url"],
    ["services.12.clientType", "services[12].clientType"],
    ["education.1", "education[1]"],
    ["contacts.phone", "contacts.phone"],
  ])("%s → %s", (path, expected) => {
    expect(toFormFieldName(path)).toBe(expected);
  });
});

describe("toFieldErrors", () => {
  it("берёт строки и message у issues, остальное пропускает", () => {
    expect(
      toFieldErrors(["Enter a link", { message: "Too long" }, { message: 1 }, null, 5]),
    ).toEqual([{ message: "Enter a link" }, { message: "Too long" }]);
  });
});
