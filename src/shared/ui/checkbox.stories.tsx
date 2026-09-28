import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";
import { Field, FieldLabel } from "./field";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { id: "checkbox" },
  render: (args) => (
    <Field orientation="horizontal">
      <Checkbox {...args} />
      <FieldLabel htmlFor={args.id} className="font-normal">
        Online sessions
      </FieldLabel>
    </Field>
  ),
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Invalid: Story = { args: { "aria-invalid": true } };

export const Disabled: Story = { args: { disabled: true } };
