"use client";

/**
 * Список значений в `<code>` с пунктуацией, как в остальных списках документа: `;` после каждого
 * пункта, `.` после последнего.
 */
export function CodeList({ items }: { items: readonly string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item}>
          <code>{item}</code>
          {index < items.length - 1 ? ";" : "."}
        </li>
      ))}
    </ul>
  );
}
