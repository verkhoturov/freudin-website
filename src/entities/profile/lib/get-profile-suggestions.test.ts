import { describe, expect, it } from "vitest";
import { getProfileSuggestions } from "./get-profile-suggestions";

describe("getProfileSuggestions", () => {
  it("берёт адрес из username провайдера раньше имени и почты", () => {
    const suggestions = getProfileSuggestions(
      { preferred_username: "Anna_S", full_name: "Анна Смирнова" },
      "ivan.petrov1987@example.com",
    );
    expect(suggestions.username).toBe("anna_s");
    expect(suggestions.displayName).toBe("Анна Смирнова");
  });

  it("без username провайдера строит адрес из имени латиницей", () => {
    expect(getProfileSuggestions({ name: " Анна Смирнова " }, null).username).toBe("anna-smirnova");
  });

  it("почту использует, только если из имени адрес не получился", () => {
    expect(getProfileSuggestions({ name: "李" }, "anna.smirnova+work@example.com").username).toBe(
      "anna-smirnova-work",
    );
  });

  it("пропускает недопустимые и зарезервированные кандидаты", () => {
    expect(
      getProfileSuggestions({ user_name: "admin", name: "Jo" }, "zoe@example.com").username,
    ).toBe("zoe");
    expect(getProfileSuggestions({}, null).username).toBeNull();
  });

  it("обрезает адрес до 30 символов без дефиса на конце", () => {
    const username = getProfileSuggestions({ name: `${"a".repeat(29)} bcd` }, null).username;
    expect(username).toBe("a".repeat(29));
  });

  it("обрезает имя до 60 символов", () => {
    expect(getProfileSuggestions({ name: "a".repeat(70) }, null).displayName).toHaveLength(60);
  });

  it("принимает только фото по https", () => {
    expect(
      getProfileSuggestions({ avatar_url: "https://lh3.googleusercontent.com/a" }, null),
    ).toMatchObject({ avatarUrl: "https://lh3.googleusercontent.com/a" });
    expect(
      getProfileSuggestions({ picture: "http://example.com/a.jpg" }, null).avatarUrl,
    ).toBeNull();
    expect(getProfileSuggestions({ picture: "not a url" }, null).avatarUrl).toBeNull();
  });
});
