import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProfileInput } from "@/entities/profile";

type OnboardingDraft = {
  /** Чей черновик: в той же вкладке может войти другой пользователь. */
  userId: string;
  values: ProfileInput;
};

type OnboardingDraftState = {
  draft: OnboardingDraft | null;
  saveDraft: (draft: OnboardingDraft) => void;
  clearDraft: () => void;
};

/** Черновик онбординга: переживает перезагрузку страницы, живёт до закрытия вкладки. Фото не храним. */
export const useOnboardingDraftStore = create<OnboardingDraftState>()(
  persist(
    (set) => ({
      draft: null,
      saveDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: "freudin:onboarding-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
