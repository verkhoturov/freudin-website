import type { Preview } from "@storybook/nextjs-vite";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "../src/app/globals.css";

// Повторяет подключение шрифта в src/app/layout.tsx
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

// Порталы (диалоги, меню, тосты) рендерятся в body, поэтому переменная шрифта нужна на <html>
document.documentElement.classList.add(geistSans.variable, "antialiased");

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    layout: "padded",
  },
  globalTypes: {
    theme: {
      description: "Тема",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    // Тему ставит next-themes, как на сайте (класс .dark на <html>), а выбирают её в тулбаре
    (Story, { globals }) => (
      <ThemeProvider attribute="class" forcedTheme={globals.theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
