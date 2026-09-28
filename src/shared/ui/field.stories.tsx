import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Field",
  component: Field,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDescription: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Input id="name" defaultValue="Anna Freud" />
      <FieldDescription>Shown at the top of your page.</FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel htmlFor="username">Page address</FieldLabel>
      <Input id="username" defaultValue="settings" aria-invalid />
      <FieldError errors={[{ message: "This address is taken" }]} />
    </Field>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="bio">About</FieldLabel>
      <Textarea id="bio" placeholder="A few words about yourself" />
      <FieldDescription>Up to 500 characters.</FieldDescription>
    </Field>
  ),
};

const approaches = ["Psychoanalysis", "CBT", "Gestalt therapy", "Existential therapy"];

export const CheckboxGroup: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend variant="label">Approaches</FieldLegend>
      <FieldDescription>Choose up to 3.</FieldDescription>
      <FieldGroup className="gap-3">
        {approaches.map((label, index) => (
          <Field key={label} orientation="horizontal">
            <Checkbox id={`approach-${index}`} defaultChecked={index === 0} />
            <FieldLabel htmlFor={`approach-${index}`} className="font-normal">
              {label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    </FieldSet>
  ),
};
