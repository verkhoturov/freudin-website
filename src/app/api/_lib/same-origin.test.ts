import { describe, expect, it } from "vitest";
import { HttpError } from "./http-error";
import { assertSameOrigin } from "./same-origin";

function request(method: string, headers: Record<string, string> = {}): Request {
  return new Request("https://www.freud.in/api/profile", { method, headers });
}

describe("assertSameOrigin", () => {
  it.each(["GET", "HEAD", "OPTIONS"])("не проверяет безопасный метод %s", (method) => {
    expect(() =>
      assertSameOrigin(request(method, { "sec-fetch-site": "cross-site" })),
    ).not.toThrow();
  });

  it("пропускает запрос со своего сайта", () => {
    expect(() =>
      assertSameOrigin(request("POST", { "sec-fetch-site": "same-origin" })),
    ).not.toThrow();
    expect(() =>
      assertSameOrigin(request("PATCH", { origin: "https://www.freud.in" })),
    ).not.toThrow();
  });

  it("пропускает запрос не из браузера: без Sec-Fetch-Site и Origin", () => {
    expect(() => assertSameOrigin(request("DELETE"))).not.toThrow();
  });

  it.each<Record<string, string>>([
    { "sec-fetch-site": "cross-site" },
    { "sec-fetch-site": "same-site" },
    { "sec-fetch-site": "none" },
    { origin: "https://evil.com" },
    { origin: "https://freud.in" },
    { origin: "null" },
    // Sec-Fetch-Site важнее Origin
    { "sec-fetch-site": "cross-site", origin: "https://www.freud.in" },
  ])("отклоняет %j с 403", (headers) => {
    try {
      assertSameOrigin(request("POST", headers));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({ status: 403, code: "forbidden" });
    }
  });
});
