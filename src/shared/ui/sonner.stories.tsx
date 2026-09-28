import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { Button } from "./button";
import { Toaster } from "./sonner";

// Тексты — из настоящих тостов сайта
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
      <Button variant="outline" onClick={() => toast.error("Couldn’t copy the link")}>
        Error
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
