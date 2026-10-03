import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionNav } from "./section-nav";

const meta = {
  title: "Freudin/Section Nav",
  component: SectionNav,
  args: {
    "aria-label": "Settings sections",
    className: "lg:w-48",
    items: [
      { href: "/settings?section=account", label: "Account" },
      { href: "/settings?section=profile", label: "Public profile", current: true },
      { href: "/settings?section=search", label: "Search details" },
    ],
  },
} satisfies Meta<typeof SectionNav>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Сайдбар настроек: выбранный раздел на фоне accent. Уже `lg` — ряд кнопок. */
export const Default: Story = {};
