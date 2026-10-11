-- Валюта цен — одна на профиль (шаг 54): её выбирают в Settings → Account, а цену сессии
-- и цены карточек услуг указывают без валюты. Валюта лежит в прежней колонке price_currency:
-- её читает код, который работает на проде до выкладки нового, поэтому миграция ничего
-- не переименовывает и не удаляет. NULL код читает как USD: прежний онбординг пишет NULL.

alter table public.profiles
  alter column price_currency set default 'USD',
  -- Валюта есть и без цены сессии
  drop constraint profiles_price_pair_check;

-- У профилей без цены сессии берём валюту карточек услуг, иначе — USD
update public.profiles
set price_currency = coalesce(
  (
    select item -> 'price' ->> 'currency'
    from jsonb_array_elements(services) as item
    where jsonb_typeof(item -> 'price') = 'object'
    limit 1
  ),
  'USD'
)
where price_currency is null;

-- То же, что в add_page_content, но валюта в цене карточки необязательна: новый код хранит
-- только сумму, у старых карточек валюта остаётся и не читается. Заодно цена без суммы
-- (`{}`) теперь отклоняется: прежнее `= 'number'` давало NULL, и CHECK её пропускал
create or replace function public.is_valid_profile_services(services jsonb, client_types text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when jsonb_typeof(services) <> 'array' then false
    else jsonb_array_length(services) <= 10 and not exists (
      select from jsonb_array_elements(services) as item
      where jsonb_typeof(item) <> 'object'
        or jsonb_typeof(item -> 'clientType') is distinct from 'string'
        or not ((item ->> 'clientType') = any (client_types))
        or jsonb_typeof(item -> 'title') is distinct from 'string'
        or char_length(item ->> 'title') not between 1 and 80
        or jsonb_typeof(item -> 'description') is distinct from 'string'
        or char_length(item ->> 'description') > 500
        or jsonb_typeof(item -> 'highlighted') is distinct from 'boolean'
        or case jsonb_typeof(item -> 'durationMinutes')
          when 'null' then false
          when 'number' then not (
            (item ->> 'durationMinutes')::numeric between 1 and 600
            and (item ->> 'durationMinutes')::numeric = trunc((item ->> 'durationMinutes')::numeric)
          )
          else true
        end
        or case jsonb_typeof(item -> 'price')
          when 'null' then false
          when 'object' then not (
            jsonb_typeof(item -> 'price' -> 'amount') is not distinct from 'number'
            and (
              item -> 'price' -> 'currency' is null
              or (
                jsonb_typeof(item -> 'price' -> 'currency') = 'string'
                and (item -> 'price' ->> 'currency') ~ '^[A-Z]{3}$'
              )
            )
            and (item -> 'price' ->> 'amount')::numeric between 1 and 100000000
            and (item -> 'price' ->> 'amount')::numeric = trunc((item -> 'price' ->> 'amount')::numeric)
          )
          else true
        end
    )
  end
$$;
