# Supabase

Возврат к [обзору сервисов](../../README.md#внешние-сервисы); переменные окружения —
в [README](../../README.md#переменные-окружения). Правила изменения базы —
в [database.md](../workflows/database.md).

Один облачный проект `freudin_data` в регионе eu-central-1 (Франкфурт). Он же прод: отдельной
базы для разработки нет. Тариф Free: если к базе неделю никто не обращается, проект засыпает,
и сайт перестаёт открывать страницы. Разбудить его можно кнопкой Restore в дашборде.
Автоматических бэкапов на Free нет, копии делаем сами (см. [«Резервные копии»](#резервные-копии)).

- Authentication → URL Configuration: Site URL `https://www.freud.in`, в Redirect URLs —
  `http://localhost:3000/**` для локальной разработки.
- Схема меняется только миграциями. Новая миграция создаётся командой
  `npx supabase migration new <name>`, применяется командой `npm run db:push`, после неё
  обновляются типы: `npm run db:types`. Команда берёт типы через Management API по
  `SUPABASE_ACCESS_TOKEN`: если токен истёк, она пишет в файл типов ошибку `Unauthorized` —
  выпусти новый токен (Account → Access Tokens в дашборде Supabase) и замени его в `.env`.
- Supabase CLI уже привязан к проекту (`supabase link`). На новой машине привяжи заново:
  `npx supabase link --project-ref <ref>`.
- Прямой адрес базы доступен только по IPv6. Если сеть его не поддерживает, CLI сам идёт через
  пулер, а для `psql` используй `aws-0-eu-central-1.pooler.supabase.com:5432` с пользователем
  `postgres.<ref>`.
- Таблицы, функции базы и bucket'ы Storage описаны в
  [`docs/architecture/4.code.md`](../../docs/architecture/4.code.md#postgresql-and-storage).
- Справочник городов `cities` для профиля психолога — данные
  [GeoNames](https://www.geonames.org) (лицензия CC BY 4.0): города от 5000 жителей
  и административные центры, около 64 тыс. строк. Их загружает миграция `*_seed_cities.sql`,
  собранная скриптом, руками её не правим. Обновить справочник:
  `npx supabase migration new update_cities`, затем
  `node scripts/generate-cities-migration.mjs supabase/migrations/<новый файл>.sql`
  (нужны Node 23.6+ и `unzip`) и `npm run db:push`. Миграция добавляет и обновляет города,
  но не удаляет: на них могут ссылаться профили.
  Атрибуцию GeoNames, которую требует лицензия, публикует `/terms` (раздел Intellectual property).

## Резервные копии

Запусти Docker Desktop и выполни `npm run db:dump`. Делай копию перед каждым `npm run db:push`
и регулярно, например раз в неделю. Команда создаёт папку `backups/<дата-время>/` с тремя
файлами:

- `roles.sql` — настройки ролей;
- `schema.sql` — схема `public`: таблицы, функции, RLS-политики, права;
- `data.sql` — данные: пользователи (`auth.users`, `auth.identities`), профили, записи
  о файлах Storage.

В копию не входят:

- сессии и токены входа: после восстановления пользователи войдут заново;
- сами файлы фото и документов (Storage хранит их отдельно от базы);
- политики Storage: они есть в миграциях `*_create_avatars_bucket.sql`
  и `*_create_documents_bucket.sql`.

В копиях персональные данные. Папка `backups/` не попадает в git, файлы доступны только
владельцу. Старые копии удаляй вручную.

Восстановление в новый пустой проект Supabase (строку подключения к его базе возьми
в дашборде: Connect → Session pooler):

```bash
cd backups/<дата-время>
psql --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql --dbname "<строка подключения>"
```

После этого выполни блоки `create policy` из миграций `*_create_avatars_bucket.sql`
и `*_create_documents_bucket.sql`. В рабочую
базу копию целиком не накатывают: отдельные строки восстанавливай вручную по `data.sql`.

