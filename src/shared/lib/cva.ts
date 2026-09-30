/**
 * Варианты оформления компонента: замена библиотеки class-variance-authority с тем же API.
 *
 * Зачем: у кнопки, поля или алерта есть вариации (`variant: "outline"`, `size: "sm"`), и каждой
 * соответствует свой набор классов. `cva` описывает их в одном месте и возвращает функцию,
 * которая по выбранным вариантам собирает строку классов, а `VariantProps` выводит из описания
 * типы пропсов (`variant?: "default" | "outline" | …`). Компоненты shadcn написаны на `cva`, поэтому
 * API тот же: при `npx shadcn add` достаточно поменять импорт на `@/shared/lib/cva`.
 *
 * Конфликты классов функция не разрешает, как и оригинал: результат оборачивают в `cn`.
 * `compoundVariants` (классы для сочетания вариантов) нет — компонентам проекта он не нужен.
 *
 * @example
 * const buttonVariants = cva("inline-flex", {
 *   variants: { size: { default: "h-8", sm: "h-7" } },
 *   defaultVariants: { size: "default" },
 * });
 * buttonVariants({ size: "sm", className: "w-full" }); // "inline-flex h-7 w-full"
 */

type Variants = Record<string, Record<string, string>>;

// Варианты с ключами "true" и "false" принимают boolean, как в оригинале
type VariantValue<Options> = keyof Options extends "true" | "false" ? boolean : keyof Options;

type VariantSelection<V extends Variants> = {
  // null — вариант не применять, даже значение по умолчанию
  [Name in keyof V]?: VariantValue<V[Name]> | null;
};

type VariantsConfig<V extends Variants> = {
  variants?: V;
  defaultVariants?: VariantSelection<V>;
};

type VariantsFunctionProps<V extends Variants> = VariantSelection<V> & {
  class?: string;
  className?: string;
};

export function cva<V extends Variants>(base: string, config: VariantsConfig<V> = {}) {
  const { variants, defaultVariants } = config;
  return (props: VariantsFunctionProps<V> = {}): string => {
    const classes = [base];
    if (variants) {
      for (const name in variants) {
        // undefined — берём значение по умолчанию, null — вариант выключен
        const selected = props[name];
        const value = selected === undefined ? defaultVariants?.[name] : selected;
        if (value !== undefined && value !== null) classes.push(variants[name][String(value)]);
      }
    }
    classes.push(props.class ?? "", props.className ?? "");
    return classes.filter(Boolean).join(" ");
  };
}

/** Пропсы вариантов из функции `cva`: `VariantProps<typeof buttonVariants>`. */
export type VariantProps<Fn> = Fn extends (props?: infer Props) => string
  ? Omit<NonNullable<Props>, "class" | "className">
  : never;
