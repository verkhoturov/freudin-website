import { describe, expect, it } from "vitest";
import { profileSectionIds } from "../config/sections";
import { normalizeSectionOrder } from "./section-order";

describe("normalizeSectionOrder", () => {
  it("пустой порядок — порядок по умолчанию", () => {
    expect(normalizeSectionOrder([])).toEqual(profileSectionIds);
  });

  it("сохраняет заданный порядок и дописывает недостающие блоки в конец", () => {
    const order = normalizeSectionOrder(["links", "bio"]);
    expect(order.slice(0, 2)).toEqual(["links", "bio"]);
    expect(order.slice(2)).toEqual(
      profileSectionIds.filter((id) => id !== "links" && id !== "bio"),
    );
  });

  it("отбрасывает неизвестные блоки и повторы", () => {
    const order = normalizeSectionOrder(["faq", "unknown", "faq", "bio"]);
    expect(order.slice(0, 2)).toEqual(["faq", "bio"]);
    expect(order).toHaveLength(profileSectionIds.length);
    expect(new Set(order).size).toBe(order.length);
  });
});
