/**
 * Параметры адреса настроек после привязки способа входа: `?linked=<провайдер>` при успехе,
 * `?link_error=<код ошибки>` при ошибке.
 */
export const identityLinkParams = { linked: "linked", error: "link_error" } as const;
