import { describe, expect, it } from "vitest";
import { getOAuthErrorCode } from "./auth.server";

describe("getOAuthErrorCode", () => {
  it("отмена у провайдера — access_denied", () => {
    expect(getOAuthErrorCode("access_denied", "The user denied access")).toBe("access_denied");
  });

  it("провайдер не отдал email — email_required", () => {
    expect(
      getOAuthErrorCode(
        "server_error",
        "Error getting user email from external provider: missing email",
      ),
    ).toBe("email_required");
  });

  it("остальное — oauth_failed", () => {
    expect(getOAuthErrorCode("server_error", null)).toBe("oauth_failed");
    expect(getOAuthErrorCode("invalid_request", "Unsupported provider")).toBe("oauth_failed");
  });
});
