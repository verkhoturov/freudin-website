"use client";

import { ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Уточнение серым после названия: регион города. */
  hint?: string;
  disabled?: boolean;
};

type ComboboxProps = {
  id?: string;
  /** Текст на кнопке: выбранное. `null` — показываем `placeholder`. */
  valueLabel: string | null;
  placeholder: string;
  options: ComboboxOption[];
  isSelected: (value: string) => boolean;
  onSelect: (value: string) => void;
  /** Мультивыбор: список не закрывается после выбора. */
  multiple?: boolean;
  searchPlaceholder: string;
  /** Текст, когда ничего не найдено. */
  emptyText: string;
  /**
   * Поиск на сервере: строку поиска хранит родитель и сам подбирает `options`, cmdk их
   * не фильтрует. Без `search` список фильтруется по названиям.
   */
  search?: { value: string; onValueChange: (value: string) => void };
  /** Кнопка очистки рядом со списком, пока что-то выбрано. `clearLabel` — её `aria-label`. */
  onClear?: () => void;
  clearLabel?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

/** Выбор из длинного списка с поиском: кнопка открывает список с полем поиска. */
export function Combobox({
  id,
  valueLabel,
  placeholder,
  options,
  isSelected,
  onSelect,
  multiple = false,
  searchPlaceholder,
  emptyText,
  search,
  onClear,
  clearLabel = "Clear",
  disabled,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const isClearable = Boolean(onClear && valueLabel);

  // Кнопка очистки лежит поверх правого края списка, а не рядом: так ширина поля не прыгает.
  // Кнопки — соседи, а не вложенные: кнопка внутри кнопки недопустима
  return (
    <div className={cn("relative min-w-0", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            className="w-full justify-between font-normal">
            <span
              className={cn(
                "truncate",
                !valueLabel && "text-muted-foreground",
                // Место под кнопку очистки перед стрелкой
                isClearable && "mr-7",
              )}>
              {valueLabel ?? placeholder}
            </span>
            <ChevronsUpDownIcon aria-hidden="true" className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-60 p-0">
          <Command shouldFilter={!search}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search?.value}
              onValueChange={search?.onValueChange}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    disabled={option.disabled}
                    // Галочку справа рисует сам CommandItem
                    data-checked={isSelected(option.value)}
                    onSelect={() => {
                      onSelect(option.value);
                      if (!multiple) setOpen(false);
                    }}>
                    <span className="truncate">
                      {option.label}
                      {option.hint ? (
                        <span className="text-muted-foreground">, {option.hint}</span>
                      ) : null}
                      {isSelected(option.value) ? (
                        <span className="sr-only"> (selected)</span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isClearable ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={clearLabel}
          disabled={disabled}
          onClick={onClear}
          className="absolute top-1/2 right-8 -translate-y-1/2">
          <XIcon aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
