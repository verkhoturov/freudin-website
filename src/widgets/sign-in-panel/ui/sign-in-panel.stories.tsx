import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { SignInPanel } from "./sign-in-panel";

const meta = {
  title: "Widgets/Sign in panel",
  component: SignInPanel,
  // В ките переход к провайдеру не нужен: клик только включает ожидание
  decorators: [
    (Story) => (
      <div className="max-w-sign-in" onClickCapture={(event) => event.preventDefault()}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignInPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** После клика: спиннер и «Redirecting to…», остальные кнопки неактивны. */
export const Pending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "Continue with Google" }));
  },
};
