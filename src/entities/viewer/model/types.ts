/**
 * Текущий пользователь — ответ `GET /api/me`. Профиль и подсказки для онбординга добавятся
 * на шаге 8 плана.
 */
export type Viewer = {
  user: {
    id: string;
    /** У Telegram email нет. */
    email: string | null;
  };
};
