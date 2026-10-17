-- Ограничение частоты запросов (шаг 67.4 плана, решение пользователя 17.10.2026): перебор пароля
-- скрытой страницы и адресов страниц. Счётчики общие для всех серверов приложения, поэтому
-- лимит не обходится запросами к разным экземплярам. Ключ — область и HMAC адреса IP или имени
-- страницы: сам IP в базе не хранится. Строки живут сутки.

create table public.rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  hits integer not null default 1
);

comment on table public.rate_limits is 'Счётчики запросов по ключам за окно времени';

-- Пишет и читает только сервер приложения (service_role) через функцию ниже
alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

-- Засчитывает запрос. Возвращает 0, если лимит не превышен, иначе через сколько секунд окно
-- закончится (для Retry-After). Вставка с on conflict блокирует строку ключа, поэтому
-- параллельные запросы считаются по одному
create function public.consume_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_window interval := make_interval(secs => p_window_seconds);
  v_hits integer;
  v_started timestamptz;
begin
  insert into public.rate_limits as current (key)
  values (p_key)
  on conflict (key) do update set
    hits = case when current.window_started_at <= now() - v_window
      then 1 else current.hits + 1 end,
    window_started_at = case when current.window_started_at <= now() - v_window
      then now() else current.window_started_at end
  returning hits, window_started_at into v_hits, v_started;

  -- ponytail: уборка старых строк в 1% вызовов; pg_cron, если таблица заметно вырастет
  if random() < 0.01 then
    delete from public.rate_limits where window_started_at < now() - interval '1 day';
  end if;

  if v_hits <= p_limit then
    return 0;
  end if;
  return greatest(1, ceil(extract(epoch from v_started + v_window - now())))::integer;
end;
$$;

revoke execute on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
