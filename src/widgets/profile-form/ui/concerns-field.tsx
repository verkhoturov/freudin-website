"use client";

import { useState } from "react";
import {
  type ClientType,
  concernGroups,
  concernIds,
  isConcernGroupAvailable,
} from "@/entities/profile";
import { Checkbox } from "@/shared/ui/checkbox";
import { DisclosureButton } from "@/shared/ui/disclosure-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { CheckboxGroup } from "./checkbox-group";

type ConcernId = (typeof concernIds)[number];

const concernGroupOptions = concernGroups.map((group) => ({
  ...group,
  options: Object.entries(group.concerns).map(([value, label]) => ({
    value: value as ConcernId,
    label,
  })),
}));

type ConcernsFieldProps = {
  value: readonly ConcernId[];
  onChange: (value: ConcernId[]) => void;
  onBlur: () => void;
  /** Works with: от него зависят доступные группы. */
  clientTypes: readonly ClientType[];
  errors: { message: string }[];
};

/**
 * Запросы клиентов: группы сворачиваются и показывают, сколько в них выбрано, поиск и фильтр
 * «только выбранные» сужают список, не снимая отмеченного. Группы, недоступные при текущем
 * Works with, не показываем: их запросы схема отбросит при сохранении.
 */
export function ConcernsField({
  value,
  onChange,
  onBlur,
  clientTypes,
  errors,
}: ConcernsFieldProps) {
  const [query, setQuery] = useState("");
  const [isSelectedOnly, setIsSelectedOnly] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const search = query.trim().toLowerCase();
  const isFiltered = search !== "" || isSelectedOnly;

  const groups = concernGroupOptions
    .filter((group) => isConcernGroupAvailable(group, clientTypes))
    .map((group) => {
      const selected = group.options.filter((option) => value.includes(option.value));
      const isGroupMatch = search !== "" && group.label.toLowerCase().includes(search);
      const shown = group.options.filter(
        (option) =>
          (search === "" || isGroupMatch || option.label.toLowerCase().includes(search)) &&
          (!isSelectedOnly || value.includes(option.value)),
      );
      return { ...group, selected, shown };
    });
  const selectedCount = groups.reduce((count, group) => count + group.selected.length, 0);
  const shownGroups = isFiltered ? groups.filter((group) => group.shown.length > 0) : groups;

  const toggleGroup = (id: string) =>
    setExpandedGroups((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <FieldSet>
      <FieldLegend variant="label">Client concerns you work with</FieldLegend>
      <FieldDescription aria-live="polite">
        {selectedCount === 0 ? "None selected" : `${selectedCount} selected`}
      </FieldDescription>
      <div className="flex flex-col gap-3 @md:flex-row @md:items-center">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search concerns"
          placeholder="Search concerns"
          autoComplete="off"
          className="@md:max-w-72"
        />
        <Field orientation="horizontal" className="w-auto">
          <Checkbox
            id="concerns-selected-only"
            checked={isSelectedOnly}
            onCheckedChange={(checked) => setIsSelectedOnly(checked === true)}
          />
          <FieldLabel htmlFor="concerns-selected-only" className="font-normal">
            Show selected only
          </FieldLabel>
        </Field>
      </div>
      {shownGroups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {isSelectedOnly && search === "" ? "No concerns selected yet." : "No concerns found."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shownGroups.map((group) => {
            // При поиске и фильтре группы с совпадениями раскрыты: найденное сразу видно
            const isExpanded = isFiltered || expandedGroups.includes(group.id);
            const contentId = `concerns-${group.id}-content`;
            const groupIds = new Set<ConcernId>(group.options.map((option) => option.value));
            return (
              <li key={group.id} className="flex flex-col gap-2 rounded-xl border p-3">
                <h2 className="flex font-medium text-sm">
                  <DisclosureButton
                    expanded={isExpanded}
                    controls={contentId}
                    disabled={isFiltered}
                    onClick={() => toggleGroup(group.id)}
                    className="min-h-8 flex-1">
                    <span className="min-w-0 flex-1 truncate">{group.label}</span>
                    {group.selected.length > 0 ? (
                      <span className="shrink-0 font-normal text-muted-foreground">
                        {group.selected.length} selected
                      </span>
                    ) : null}
                  </DisclosureButton>
                </h2>
                {!isExpanded && group.selected.length > 0 ? (
                  <p className="pl-5.5 text-muted-foreground text-sm">
                    {group.selected.map((option) => option.label).join(", ")}
                  </p>
                ) : null}
                <div id={contentId} hidden={!isExpanded}>
                  <CheckboxGroup
                    name={`concerns-${group.id}`}
                    legend={group.label}
                    legendClassName="sr-only"
                    options={group.shown}
                    // В значении все отмеченные запросы группы, и скрытые фильтром тоже:
                    // снятие и отметка видимых их не трогают
                    value={value.filter((id) => groupIds.has(id))}
                    // Храним в порядке справочника: иначе снятая и снова отмеченная галочка
                    // считалась бы изменением
                    onChange={(groupValue) =>
                      onChange(
                        concernIds.filter((id) =>
                          groupIds.has(id) ? groupValue.includes(id) : value.includes(id),
                        ),
                      )
                    }
                    onBlur={onBlur}
                    className="sm:grid sm:grid-cols-2 @3xl:grid-cols-3"
                    errors={[]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {errors.length > 0 ? <FieldError errors={errors} /> : null}
    </FieldSet>
  );
}
