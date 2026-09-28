import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>Main action</Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Delete
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args}>Default</Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <PlusIcon data-icon="inline-start" />
        Add link
      </Button>
      <Button {...args} variant="destructive">
        <Trash2Icon data-icon="inline-start" />
        Delete account
      </Button>
      <Button {...args} variant="ghost" size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
      <Button {...args} variant="outline" size="icon-sm" aria-label="Delete">
        <Trash2Icon />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Variants.render,
};
