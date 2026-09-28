import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeToggle } from "./theme-toggle";

// В Storybook тему задаёт тулбар, поэтому выбор в меню здесь не применяется
const meta = {
  title: "Freudin/Theme Toggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
