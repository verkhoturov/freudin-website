import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Container } from "./container";

const meta = {
  title: "Freudin/Container",
  component: Container,
  parameters: { layout: "fullscreen" },
  args: {
    className: "py-page",
    children: (
      <div className="rounded-lg border border-dashed bg-card p-4 text-muted-foreground text-sm">
        Page content aligns to the container, like the header and footer.
      </div>
    ),
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Юридические документы. */
export const DocumentWidth: Story = { args: { width: "document" } };

/** Онбординг и настройки. */
export const FormWidth: Story = { args: { width: "form" } };

/** Вход. */
export const SignInWidth: Story = { args: { width: "sign-in" } };
