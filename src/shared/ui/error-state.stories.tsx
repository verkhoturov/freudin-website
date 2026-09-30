import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./error-state";

const meta = {
  title: "Freudin/Error State",
  component: ErrorState,
  args: { onRetry: fn() },
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Страница ошибки (error.tsx и global-error.tsx). */
export const Default: Story = {};

/** Не загрузились данные страницы: личная страница, настройки, онбординг. */
export const LoadFailed: Story = { args: { title: "Couldn’t load the page" } };
