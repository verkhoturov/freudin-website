import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CollapsedBlocksState = {
  /** Свёрнутые блоки настроек по id пользователя: в одном браузере может входить несколько. */
  collapsedByUser: Record<string, string[]>;
  setCollapsed: (userId: string, blockId: string, collapsed: boolean) => void;
};

/**
 * Какие блоки настроек свёрнуты: переживает перезагрузку и закрытие браузера. Храним только id
 * блоков конструктора (`bio`, `contacts`), значения полей сюда не попадают. По умолчанию
 * блок развёрнут.
 */
export const useCollapsedBlocksStore = create<CollapsedBlocksState>()(
  persist(
    (set) => ({
      collapsedByUser: {},
      setCollapsed: (userId, blockId, collapsed) =>
        set(({ collapsedByUser }) => {
          const current = collapsedByUser[userId] ?? [];
          const next = current.filter((id) => id !== blockId);
          if (collapsed) next.push(blockId);
          return { collapsedByUser: { ...collapsedByUser, [userId]: next } };
        }),
    }),
    {
      name: "freudin:settings-collapsed-blocks",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ collapsedByUser: state.collapsedByUser }),
    },
  ),
);
