import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./combobox";

const languages: ComboboxOption[] = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ru", label: "Russian" },
  { value: "uk", label: "Ukrainian" },
];

const cities: ComboboxOption[] = [
  { value: "1", label: "Berlin", hint: "Berlin" },
  { value: "2", label: "Hamburg", hint: "Hamburg" },
  { value: "3", label: "Munich", hint: "Bavaria" },
];

const labelOf = (options: ComboboxOption[], value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

function SingleCombobox() {
  const [value, setValue] = useState<string | null>("3");
  return (
    <Combobox
      valueLabel={value ? labelOf(cities, value) : null}
      placeholder="Select a city"
      options={cities}
      isSelected={(option) => option === value}
      onSelect={setValue}
      onClear={() => setValue(null)}
      clearLabel="Clear city"
      searchPlaceholder="Search cities…"
      emptyText="No cities found."
    />
  );
}

function MultipleCombobox() {
  const [values, setValues] = useState(["en", "de"]);
  return (
    <Combobox
      multiple
      valueLabel={
        values.length ? values.map((value) => labelOf(languages, value)).join(", ") : null
      }
      placeholder="Select languages"
      options={languages}
      isSelected={(value) => values.includes(value)}
      onSelect={(value) =>
        setValues((current) =>
          current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        )
      }
      searchPlaceholder="Search languages…"
      emptyText="No languages found."
    />
  );
}

const meta = {
  title: "Components/Combobox",
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = { render: () => <SingleCombobox /> };

export const Multiple: Story = { render: () => <MultipleCombobox /> };

export const Disabled: Story = {
  render: () => (
    <Combobox
      valueLabel={null}
      placeholder="Select a country first"
      options={[]}
      isSelected={() => false}
      onSelect={() => {}}
      searchPlaceholder="Search cities…"
      emptyText="No cities found."
      disabled
    />
  ),
};
