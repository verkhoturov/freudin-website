import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotFoundState } from "./not-found-state";

const meta = {
  title: "Freudin/Not Found State",
  component: NotFoundState,
} satisfies Meta<typeof NotFoundState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
