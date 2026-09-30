import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import { Toaster, toast } from "./sonner";

// Тексты — из настоящих тостов сайта. Обычный тост держится 4 с, ошибка — 8 с. Тост с тем же
// текстом заменяет прежний: повторный клик по кнопке не добавит второй
const meta = {
  title: "Components/Toast",
  component: Toaster,
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Toaster {...args} />
      <Button variant="outline" onClick={() => toast.success("Changes saved")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.info("No changes to save")}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Couldn’t copy the link. Please try again.")}>
        Error (8 s)
      </Button>
      <Button variant="outline" onClick={() => toast.loading("Signing out…")}>
        Loading
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Your page is ready", {
            action: { label: "Copy link", onClick: () => {} },
          })
        }>
        With action
      </Button>
    </div>
  ),
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
