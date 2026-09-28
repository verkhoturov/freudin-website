import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  args: { placeholder: "A few words about yourself", "aria-label": "About" },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue:
      "Psychoanalyst with 10 years of practice. I work with adults and couples, online and in person.",
  },
};

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = { args: { disabled: true } };
