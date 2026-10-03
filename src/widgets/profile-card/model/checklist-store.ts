import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ChecklistState = {
  /** Адреса страниц, где владелец скрыл подсказки. */
  dismissed: string[];
  dismiss: (username: string) => void;
};

/** Скрытые подсказки «Finish your page»: переживают перезагрузку и закрытие браузера. */
export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set) => ({
      dismissed: [],
      dismiss: (username) =>
        set(({ dismissed }) => ({
          dismissed: dismissed.includes(username) ? dismissed : [...dismissed, username],
        })),
    }),
    {
      name: "freudin:page-checklist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ dismissed: state.dismissed }),
    },
  ),
);
