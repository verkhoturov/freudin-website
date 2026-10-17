import { create } from "zustand";
import type { ProfileInput } from "@/entities/profile";

/**
 * Сохранённые значения и версия профиля, от которых считаются правки формы. Фоновое
 * обновление `/api/me` их не подменяет: иначе старое значение из формы ушло бы как правка.
 */
export type SettingsFormBase = {
  values: ProfileInput;
  version: number;
};

type SettingsDraft = {
  /** Чей черновик: в той же вкладке может войти другой пользователь. */
  userId: string;
  values: ProfileInput;
  /** От чего считаются правки черновика. */
  base: SettingsFormBase;
};

type SettingsDraftState = {
  draft: SettingsDraft | null;
  setDraft: (draft: SettingsDraft | null) => void;
};

/**
 * Несохранённые правки настроек, когда пользователь ушёл со страницы кнопкой «Назад»:
 * вернувшись, он продолжит с того же места. Только в памяти вкладки: в хранилище браузера
 * не попадает и пропадает при перезагрузке. Фото не храним.
 */
export const useSettingsDraftStore = create<SettingsDraftState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
}));
