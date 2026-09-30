/**
 * Цвета темы там, где CSS-переменные не работают: `<meta name="theme-color">` (цвет панели
 * браузера). Повторяют токены из src/app/globals.css: меняя токен, поменяй и значение здесь.
 */
export const themeColors = {
  /** `--background` светлой темы (`--neutral-50`). */
  light: "#faf7f2",
  /** `--background` тёмной темы (`--neutral-950`). */
  dark: "#171420",
} as const;
