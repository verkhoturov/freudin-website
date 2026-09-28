import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar, AvatarFallback } from "./avatar";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  args: { size: "default" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "default", "lg"] } },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>AF</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fallback: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>AF</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
