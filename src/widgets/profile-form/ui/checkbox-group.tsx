"use client";

import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/ui/field";

type CheckboxGroupProps<T extends string> = {
  /** Имя поля формы: из него собираются id галочек. */
  name: string;
  legend: string;
  /** Например, `sr-only`, когда группу уже называет заголовок вокруг. */
  legendClassName?: string;
  options: readonly { value: T; label: string }[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  onBlur?: () => void;
  /** Сколько можно отметить: когда отмечено столько, остальные галочки неактивны. */
  max?: number;
  description?: string;
  /** Ошибки поля; пустой список — поле в порядке. */
  errors: { message: string }[];
  className?: string;
};

/** Несколько галочек с общей подписью. Отмеченные значения — в порядке отметки. */
export function CheckboxGroup<T extends string>({
  name,
  legend,
  legendClassName,
  options,
  value,
  onChange,
  onBlur,
  max,
  description,
  errors,
  className,
}: CheckboxGroupProps<T>) {
  const isFull = max !== undefined && value.length >= max;
  const isInvalid = errors.length > 0;
  const descriptionId = `${name}-description`;

  return (
    <FieldSet data-invalid={isInvalid} aria-describedby={description ? descriptionId : undefined}>
      <FieldLegend variant="label" className={legendClassName}>
        {legend}
      </FieldLegend>
      {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
      <FieldGroup className={cn("gap-3", className)}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const checked = value.includes(option.value);
          const disabled = !checked && isFull;
          return (
            <Field key={option.value} orientation="horizontal" data-disabled={disabled}>
              <Checkbox
                id={id}
                checked={checked}
                disabled={disabled}
                aria-invalid={isInvalid}
                onBlur={onBlur}
                onCheckedChange={(next) =>
                  onChange(
                    next === true
                      ? [...value, option.value]
                      : value.filter((item) => item !== option.value),
                  )
                }
              />
              <FieldLabel htmlFor={id} className="font-normal">
                {option.label}
              </FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
      {isInvalid ? <FieldError errors={errors} /> : null}
    </FieldSet>
  );
}
