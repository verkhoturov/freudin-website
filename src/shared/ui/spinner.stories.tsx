import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { Spinner } from "./spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Кнопки, пока идёт запрос: спиннер, текст с многоточием, кнопка неактивна. */
export const InButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button disabled>
        <Spinner />
        Saving…
      </Button>
      <Button variant="outline" disabled>
        <Spinner />
        Signing out…
      </Button>
      <Button variant="destructive" disabled>
        <Spinner />
        Deleting…
      </Button>
      <Button variant="outline" size="sm" disabled>
        <Spinner />
        Redirecting…
      </Button>
    </div>
  ),
};
