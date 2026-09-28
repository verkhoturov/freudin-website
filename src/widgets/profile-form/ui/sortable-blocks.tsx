"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import { type ProfileSection, profileSectionLabels } from "@/entities/profile";
import { Button } from "@/shared/ui/button";

type Direction = "up" | "down";

type SortableBlocksProps = {
  order: ProfileSection[];
  /** Без `onChange` блоки идут подряд без рамок и кнопок: онбординг. */
  onChange?: (order: ProfileSection[]) => void;
  renderBlock: (section: ProfileSection) => ReactNode;
};

const moveButtonId = (section: ProfileSection, direction: Direction) =>
  `block-${section}-${direction}`;

/**
 * Блоки формы в порядке личной страницы. Порядок меняют перетаскиванием за ручку (мышь, палец)
 * и стрелками ↑↓; с клавиатуры и в скринридере — стрелками, поэтому ручка вне порядка табуляции.
 */
export function SortableBlocks({ order, onChange, renderBlock }: SortableBlocksProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [announcement, setAnnouncement] = useState("");
  // Кнопка, на которую вернуть фокус после перестановки: блок перемещается в DOM и теряет его
  const [focusTarget, setFocusTarget] = useState<{
    section: ProfileSection;
    direction: Direction;
  }>();

  useEffect(() => {
    if (!focusTarget) return;
    const { section, direction } = focusTarget;
    const button = document.getElementById(moveButtonId(section, direction));
    // У крайнего блока стрелка неактивна: фокус — на соседнюю
    const fallback = document.getElementById(
      moveButtonId(section, direction === "up" ? "down" : "up"),
    );
    (button instanceof HTMLButtonElement && !button.disabled ? button : fallback)?.focus();
  }, [focusTarget]);

  if (!onChange) {
    return order.map((section) => <Fragment key={section}>{renderBlock(section)}</Fragment>);
  }

  const move = (from: number, to: number) => {
    const section = order[from];
    onChange(arrayMove(order, from, to));
    setAnnouncement(
      `${profileSectionLabels[section]} moved to position ${to + 1} of ${order.length}.`,
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    move(order.indexOf(active.id as ProfileSection), order.indexOf(over.id as ProfileSection));
  };

  return (
    <>
      <DndContext
        id="profile-blocks"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="flex flex-col gap-4">
            {order.map((section, index) => (
              <SortableBlock
                key={section}
                section={section}
                isFirst={index === 0}
                isLast={index === order.length - 1}
                onMove={(direction) => {
                  move(index, direction === "up" ? index - 1 : index + 1);
                  setFocusTarget({ section, direction });
                }}>
                {renderBlock(section)}
              </SortableBlock>
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

type SortableBlockProps = {
  section: ProfileSection;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: Direction) => void;
  children: ReactNode;
};

function SortableBlock({ section, isFirst, isLast, onMove, children }: SortableBlockProps) {
  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section });
  const label = profileSectionLabels[section];
  const titleId = `block-${section}-title`;

  return (
    <li
      ref={setNodeRef}
      // Список вертикальный: сдвигаем только по Y, без растяжения блока
      style={{
        transform: transform ? `translate3d(0, ${Math.round(transform.y)}px, 0)` : undefined,
        transition,
      }}
      data-dragging={isDragging}
      className="relative flex flex-col gap-3 rounded-xl border bg-background p-3 data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg">
      <div className="flex items-center gap-1">
        {/* Ручка только для мыши и пальца: с клавиатуры порядок меняют стрелки */}
        <span
          ref={setActivatorNodeRef}
          {...listeners}
          aria-hidden="true"
          className="-my-1 flex size-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing">
          <GripVerticalIcon className="size-4" />
        </span>
        <h3 id={titleId} className="min-w-0 flex-1 truncate font-medium text-sm">
          {label}
        </h3>
        <Button
          id={moveButtonId(section, "up")}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${label} up`}
          disabled={isFirst}
          onClick={() => onMove("up")}>
          <ArrowUpIcon aria-hidden="true" />
        </Button>
        <Button
          id={moveButtonId(section, "down")}
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Move ${label} down`}
          disabled={isLast}
          onClick={() => onMove("down")}>
          <ArrowDownIcon aria-hidden="true" />
        </Button>
      </div>
      <fieldset aria-labelledby={titleId} className="min-w-0">
        {children}
      </fieldset>
    </li>
  );
}
