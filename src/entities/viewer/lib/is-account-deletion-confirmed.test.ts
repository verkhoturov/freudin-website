import { describe, expect, it } from "vitest";
import { isAccountDeletionConfirmed } from "./is-account-deletion-confirmed";

describe("isAccountDeletionConfirmed", () => {
  it.each(["anna", "  ANNA ", "Anna\n"])("принимает %j для anna", (value) => {
    expect(isAccountDeletionConfirmed(value, "anna")).toBe(true);
  });

  it.each(["", "ann", "anna1", "a nna", "@anna"])("отклоняет %j для anna", (value) => {
    expect(isAccountDeletionConfirmed(value, "anna")).toBe(false);
  });
});
