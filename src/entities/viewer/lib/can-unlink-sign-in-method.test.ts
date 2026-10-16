import { describe, expect, it } from "vitest";
import { canUnlinkSignInMethod } from "./can-unlink-sign-in-method";

describe("canUnlinkSignInMethod", () => {
  it("отвязывает способ, если остаётся другой подключённый", () => {
    expect(canUnlinkSignInMethod(["google", "telegram"], "google")).toBe(true);
  });

  it("не отвязывает единственный способ", () => {
    expect(canUnlinkSignInMethod(["google"], "google")).toBe(false);
  });

  it("отключённый Facebook не заменяет последний способ входа", () => {
    expect(canUnlinkSignInMethod(["google", "facebook"], "google")).toBe(false);
  });

  it("сам отключённый Facebook отвязывается", () => {
    expect(canUnlinkSignInMethod(["google", "facebook"], "facebook")).toBe(true);
  });
});
