import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const platforms = ["Telegram", "Instagram", "LinkedIn", "YouTube", "Website"];

const meta = {
  title: "Components/Select",
  component: Select,
  args: { defaultValue: "Telegram" },
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Platform" className="w-40">
        <SelectValue placeholder="Platform" />
      </SelectTrigger>
      <SelectContent>
        {platforms.map((platform) => (
          <SelectItem key={platform} value={platform}>
            {platform}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placeholder: Story = { args: { defaultValue: undefined } };

export const Disabled: Story = { args: { disabled: true } };
