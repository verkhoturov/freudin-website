"use client";

import { Checkbox } from "@/shared/ui/checkbox";
import { Field, FieldLabel } from "@/shared/ui/field";

type HighlightCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

/** Галочка «выделить на странице»: блок, ссылка или карточка услуги. */
export function HighlightCheckbox({
  id,
  checked,
  onChange,
  label = "Highlight",
}: HighlightCheckboxProps) {
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} onCheckedChange={(next) => onChange(next === true)} />
      <FieldLabel htmlFor={id} className="font-normal">
        {label}
      </FieldLabel>
    </Field>
  );
}
