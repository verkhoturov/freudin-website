import { describe, expect, it } from "vitest";
import { routes } from "@/shared/config";
import { usernameSchema } from "./username";

describe("usernameSchema", () => {
  it("приводит адрес к нижнему регистру и обрезает пробелы", () => {
    expect(usernameSchema.parse("  Anna_Smith-1 ")).toBe("anna_smith-1");
  });

  it.each([
    "ab",
    "a".repeat(31),
    "-anna",
    "anna_",
    "an na",
    "анна",
    "anna.smith",
    "anna@x",
  ])("отклоняет неверный формат %j", (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(false);
  });

  it.each(["abc", "a".repeat(30), "a-b_c", "007"])("принимает %j", (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(true);
  });

  it.each(["admin", "demo", "api", "Login", "freudin"])("отклоняет служебное слово %j", (value) => {
    const result = usernameSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("This username is reserved");
  });

  it("резервирует первые сегменты всех страниц из routes", () => {
    const segments = Object.values(routes).flatMap((route) =>
      typeof route === "string" && route !== "/" ? [route.split("/")[1]] : [],
    );
    expect(segments.length).toBeGreaterThan(0);
    for (const segment of segments) {
      expect(usernameSchema.safeParse(segment).success, segment).toBe(false);
    }
  });
});
