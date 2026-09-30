import type { Preview } from "@storybook/nextjs-vite";
import { ThemeProvider } from "next-themes";
import { fontVariables } from "../src/app/fonts";
import "../src/app/globals.css";

// Порталы (диалоги, меню, тосты) рендерятся в body, поэтому переменные шрифтов нужны на <html>
document.documentElement.classList.add(...fontVariables.split(" "), "antialiased");

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
