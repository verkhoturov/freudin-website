export const authProviders = ["google", "facebook", "telegram"] as const;

export type AuthProvider = (typeof authProviders)[number];

export const authProviderLabels: Record<AuthProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  telegram: "Telegram",
};
