import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlertIcon, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

// Как ошибка входа на /login
export const Destructive: Story = {
  args: { variant: "destructive" },
  render: (args) => (
    <Alert {...args}>
      <CircleAlertIcon />
      <AlertTitle>Couldn’t sign in. Please try again.</AlertTitle>
    </Alert>
  ),
};

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon />
      <AlertTitle>Your page is ready</AlertTitle>
      <AlertDescription>Share the link in your bio.</AlertDescription>
    </Alert>
  ),
};
