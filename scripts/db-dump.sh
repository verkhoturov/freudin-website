#!/usr/bin/env bash
# Резервная копия базы Supabase: роли, схема и данные в backups/<дата-время>/.
# supabase db dump запускает pg_dump в Docker, поэтому Docker Desktop должен быть запущен.
# Файлы Storage (фото) в копию не входят. Восстановление описано в README.
set -euo pipefail

if ! docker info >/dev/null 2>&1; then
  echo "Docker не запущен: открой Docker Desktop и повтори команду." >&2
  exit 1
fi

# В копии персональные данные пользователей: файлы доступны только владельцу.
umask 077
dir="backups/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$dir"
trap 'rm -rf "$dir"; echo "Копия не создана, папка $dir удалена." >&2' ERR

# Сессии и токены входа в копию не берём: по утёкшему файлу ими можно войти в чужой аккаунт,
# а после восстановления пользователь просто войдёт заново.
auth_temp_tables="auth.sessions,auth.refresh_tokens,auth.mfa_amr_claims,auth.flow_state"
auth_temp_tables+=",auth.one_time_tokens"

supabase db dump --linked --role-only -f "$dir/roles.sql"
supabase db dump --linked -f "$dir/schema.sql"
supabase db dump --linked --data-only --use-copy -x "$auth_temp_tables" -f "$dir/data.sql"

echo "Копия сохранена в $dir"
