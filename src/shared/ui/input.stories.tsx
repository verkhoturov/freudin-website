import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  args: { placeholder: "anna-freud", "aria-label": "Page address" },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: "anna-freud" } };

export const Invalid: Story = { args: { defaultValue: "settings", "aria-invalid": true } };

export const Disabled: Story = { args: { defaultValue: "anna-freud", disabled: true } };
