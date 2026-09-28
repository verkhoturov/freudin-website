import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Slider } from "./slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  // Как ползунок масштаба в кропе фото
  args: { defaultValue: [1.5], min: 1, max: 3, step: 0.01, "aria-label": "Zoom" },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
