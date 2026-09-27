/** Введённое подтверждение совпадает с username: без пробелов по краям и без учёта регистра. */
export function isAccountDeletionConfirmed(confirmation: string, username: string): boolean {
  return confirmation.trim().toLowerCase() === username.toLowerCase();
}
