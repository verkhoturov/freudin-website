import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Field, FieldLabel } from "./field";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const options = [
  { value: "private", label: "Only me" },
  { value: "password", label: "Anyone with the password" },
];

const meta = {
  title: "Components/Radio Group",
  component: RadioGroup,
  args: { defaultValue: "private", "aria-label": "Who can see your page" },
  render: (args) => (
    <RadioGroup {...args}>
      {options.map((option) => (
        <Field key={option.value} orientation="horizontal">
          <RadioGroupItem id={`radio-${option.value}`} value={option.value} />
          <FieldLabel htmlFor={`radio-${option.value}`} className="font-normal">
            {option.label}
          </FieldLabel>
        </Field>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
