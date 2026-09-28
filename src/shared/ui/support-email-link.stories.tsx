import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SupportEmailLink } from "./support-email-link";

const meta = {
  title: "Freudin/Support Email Link",
  component: SupportEmailLink,
} satisfies Meta<typeof SupportEmailLink>;

export default meta;

type Story = StoryObj<typeof meta>;

// Как в подвале: без своего цвета, наследует текст вокруг
export const Default: Story = {
  args: { className: "hover:text-foreground" },
  render: (args) => (
    <p className="text-muted-foreground text-sm">
      Support: <SupportEmailLink {...args} />
    </p>
  ),
};
