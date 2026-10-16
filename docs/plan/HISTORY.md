# История выполнения плана Freudin

Завершённые пункты перенесены из [`docs/PLAN.md`](../PLAN.md) 16.10.2026.
Номера, исходные формулировки, даты и результаты проверок сохранены. В частично выполненных
шагах здесь находятся только выполненные подшаги; оставшаяся работа — в активном плане.

Это исторические записи: описание системы, ограничений и процедур отражает момент выполнения.
Текущее состояние смотри в [`README.md`](../../README.md),
[`архитектуре`](../architecture/) и [`AGENTS.md`](../../AGENTS.md).

## Выполненные этапы, шаги и подшаги

### Этап A. Подготовка (начинаем сразу, внешние сервисы не нужны)

**Параллельно с шагами 1–4 ты можешь** завести аккаунты и приложения, которые понадобятся позже.
Верификация у Google и Meta может занять несколько дней, поэтому лучше начать заранее:
проект Supabase (шаг 5), проект в Google Cloud, приложение в Meta for Developers, бота
в Telegram, проект в Vercel, подключённый к репозиторию. ✅ Vercel подключён: `main` выкладывается
на `www.freud.in` (решение 12).

#### Шаг 1. Правила проекта: AGENTS.md и README.md
- [x] `AGENTS.md`: управляемый блок Next.js оставляем без изменений, ниже добавляем наши правила.
      Туда входят предпочтительный стек, правила клиент/сервер, FSD (`views` вместо `pages`,
      без `features`, правила импортов, public API, `index.server.ts`), роуты (страницы и API),
      правила состояния, форм и стилей, команды проверки.
- [x] В `AGENTS.md` явно прописать процесс: после каждой итерации сверять и обновлять `README.md`
      и отмечать прогресс в `docs/PLAN.md`; юнит-тесты писать **только по запросу пользователя**.
- [x] `README.md`: описание, стек, быстрый старт, переменные окружения, скрипты, структура, роуты,
      настройка провайдеров (дополняется по ходу работы), деплой.

**Готово, когда:** агент в новой сессии без контекста чата знает, куда класть код и как проверять
изменения.

#### Шаг 2. Каркас FSD и очистка шаблона
- [x] Удалить демо-контент create-next-app (разметку `page.tsx`, SVG в `public/`, стили-заглушки).
- [x] `lang="ru"`, шрифт Geist с `subsets: ["latin", "cyrillic"]`, базовая `metadata`.
- [x] Создать слои `views`, `widgets`, `entities`, `shared/{ui,lib,api,config}` с public API.
- [x] Заглушки view для всех страниц из 4.5, тонкие `page.tsx`, `not-found.tsx`.
- [x] `shared/config/routes.ts`: все пути в одном месте.
- [x] Границы слоёв в Biome через `noRestrictedImports` в `overrides`. Запрещаем импорты «вверх»
      по слоям, импорты в обход public API и `@supabase/*` вне серверного кода.
- [x] Пакет `server-only`; скрипт `typecheck` = `next typegen && tsc --noEmit`.

**Готово, когда:** `npm run lint`, `npm run typecheck` и `npm run build` проходят, а все роуты
открываются заглушками.

#### Шаг 3. Клиентская инфраструктура и каркас API
- [x] Установить `@tanstack/react-query` (+ devtools) и `zod`. `zustand` и `@tanstack/react-form`
      ставим на шаге 13, где они впервые нужны.
- [x] `src/app/_providers`: `QueryClientProvider` (devtools только в dev).
- [x] `shared/api`: `apiClient` (JSON и FormData, единый `ApiError` со статусом, кодом и ошибками
      по полям) и фабрика `QueryClient` (4xx не ретраим).
- [x] `src/app/api/_lib`: хелперы ответов и ошибок, разбор тела запроса через zod.
- [x] `GET /api/health` как первый сквозной запрос клиент → API.
- [x] Env: `shared/config/env.server.ts` с zod-валидацией. Валидация ленивая, чтобы `next build`
      не требовал секретов. Добавить `.env.example` и исключение `!.env.example` в `.gitignore`.

**Готово, когда:** страница-заглушка получает `/api/health` через TanStack Query.

#### Шаг 4. Дизайн-система и каркас вёрстки
- [x] `npx shadcn init` с алиасами под FSD в `components.json`: `ui → @/shared/ui`,
      `utils → @/shared/lib/utils`, `lib → @/shared/lib`, `hooks → @/shared/lib/hooks`.
      База Radix, пресет `b2fA`: стиль по умолчанию (nova), нейтральная палитра, Geist, lucide.
      Сначала был Maia с фиолетовым акцентом, по решению пользователя заменён на стандартный.
- [x] Тема: нейтральная палитра без акцента, Geist. Светлая и тёмная версии (`next-themes`),
      переключатель в шапке.
- [x] Базовые компоненты: button, card, input, textarea, label, field, avatar, dropdown-menu,
      dialog, alert-dialog, select, skeleton, separator, sonner, tooltip.
- [x] Иконки: `lucide-react` для интерфейса. Логотипы соцсетей и провайдеров берём отдельными
      SVG (simple-icons или свои по брендбукам), потому что бренд-иконки в lucide устарели.
- [x] `widgets/header` (логотип и «Войти», пока без логики), `widgets/footer` (ссылки на
      `/privacy`, `/terms`), общий контейнер страниц. Вёрстка mobile-first.

**Готово, когда:** все заглушки выглядят единообразно в обеих темах и на мобильных.

SEO-база (сделана по итогам ревью вёрстки):
- [x] Домен `www.freud.in` в `siteConfig`, `metadataBase`, Open Graph и карточка Twitter
      по умолчанию.
- [x] Картинка превью `src/app/opengraph-image.jpg` (1200×630) с alt-текстом.
- [x] `noindex, follow` для `/login`, `/onboarding` и `/settings`.
- [x] Canonical для `/`, `/privacy` и `/terms`.
- [x] `robots.txt` и `sitemap.xml` с публичными статическими страницами.

**🧑‍💻 Разработчик:** облачному окружению нужен доступ к `ui.shadcn.com` — ✅ открыт.

### Этап B. Supabase

#### Шаг 5. Проект Supabase (делаешь ты по чек-листу)
- [x] Создать проект в регионе поближе к аудитории: `freudin_data`, eu-central-1 (Франкфурт).
- [x] Взять Project URL, publishable key (`sb_publishable_…`) и secret key (`sb_secret_…`).
      Положить их в `.env` и в Vercel (окружение Production). В чат ключи не присылай.
      Проверено: ключи приложения, пароль БД и токен Management API работают.
- [x] Authentication → URL Configuration: Site URL = `https://www.freud.in`. Редиректы на этот
      адрес Supabase разрешает без списка, поэтому в Redirect URLs достаточно добавить
      `http://localhost:3000/**` для локальной разработки.
- [x] Выбрать, как я буду работать с БД. **Выбрано: переменные окружения + Supabase CLI.**
- [x] ~~Только для облачной сессии: переменные окружения~~ — перенесено в шаг 18.9 (28.09.2026):
      облачной сессии нужны ключи стенда, а не прода.
- [x] (аудит) **🧑‍💻 Разработчик:** выключить провайдер Email в Supabase → Authentication →
      Sign In / Providers. Он не используется, но включён и открывает регистрацию в обход OAuth.
      Проверено через `/auth/v1/settings`: `email: false`, включён только Google.
- [x] (аудит) **🧑‍💻 Разработчик:** проверить план Supabase. На Free проект засыпает после недели без
      активности, и нужно убедиться, что для прода есть бэкапы (или делать регулярный дамп).
      **Решено:** тариф Free, копии делаем сами командой `npm run db:dump` (`scripts/db-dump.sh`:
      роли, схема и данные в `backups/`, без сессий и токенов). Нужен ли Pro, решаем перед
      публичным запуском (шаг 18.6).

#### Шаг 6. Схема БД и Storage
- [x] `supabase/config.toml` и миграции: Supabase CLI в `devDependencies` (решение 14), проект
      привязан через `supabase link`. CLI сам читает переменные из `.env`. Прямой адрес БД
      доступен только по IPv6, поэтому CLI и `psql` ходят через пулер
      `aws-0-eu-central-1.pooler.supabase.com`. Из облачной сессии порты Postgres недоступны,
      поэтому там миграции применяются через Management API.
- [x] Миграция `profiles` по модели 4.3: CHECK-ограничения, уникальность username, триггер
      `updated_at`, RLS-политики, права ролей (`anon` — только чтение, `authenticated` — чтение,
      создание и изменение).
- [x] Миграция Storage: bucket `avatars` с политиками на `storage.objects`.
- [x] Обе миграции проверены на боевой базе в транзакции с откатом: SQL применяется,
      CHECK-ограничения отклоняют невалидные данные.
- [x] Применить миграции: `npm run db:push`. **🧑‍💻 Разработчик:** применять миграции к боевой базе
      мне не дают права сессии.
- [x] Скрипт `db:types`, типы лежат в `src/shared/api/supabase/database.types.ts`.
- [x] Advisors (безопасность и производительность): замечаний нет.
- [x] (аудит) Миграция: роль `anon` читает из `profiles` только публичные колонки (`username`,
      `display_name`, `bio`, `avatar_path`, `social_links`), без `id` и дат. Проверку адреса
      для этого перевести с `select("id")` на `select("username")`. Это вторая линия защиты:
      publishable key в браузер не попадает. Миграция `20260926083941_restrict_anon_profile_columns`
      применена 26.09.2026. Проверено на проде: гостю `select=id` и `select=*` дают 42501,
      публичный профиль и проверка адреса работают.

**Готово, когда:** таблица и bucket созданы, advisors не показывают критичных замечаний, типы
лежат в репозитории.

#### Шаг 7. Серверный доступ к Supabase
- [x] Установить `@supabase/ssr` и `@supabase/supabase-js`.
- [x] `shared/api/supabase/server.ts`: клиент с cookies пользователя (publishable key, RLS
      действует). `admin.ts`: клиент с secret key, только для удаления аккаунта и служебных
      операций. Оба `server-only`, наружу экспортируются через `@/shared/api/index.server.ts`.
- [x] `api/_lib/auth.ts`: `requireUser()` на основе `supabase.auth.getClaims()`, при отсутствии
      сессии отвечает 401. Сетевой сбой до Supabase даёт 500, а не 401.
- [x] Минимальный `GET /api/me`: гостю 401, пользователю `{ user }` с `Cache-Control: private,
      no-store`. Профиль и подсказки добавим на шаге 8.
- [x] Проверено на прод-сборке: гость и поддельная сессия получают 401, ключей и адреса
      Supabase в клиентском бандле нет.
- [x] (аудит) Проверка заголовка `Origin` (или `Sec-Fetch-Site`) в изменяющих запросах API:
      вторая линия защиты от CSRF после cookies с `SameSite=Lax`. Сделано в `withErrorHandling`
      (`_lib/same-origin.ts`), поэтому действует на все роуты. Проверено на прод-сборке:
      `cross-site`, `same-site` и чужой `Origin` получают 403, свой сайт и curl проходят.

**Готово, когда:** `GET /api/me` отвечает гостю 401, а ключей нет в клиентском бандле.

### Этап C. Авторизация

✅ Готово 08.10.2026: вход через Google и Telegram, привязка нескольких способов входа. Вход через
Facebook скрыт и перенесён в этап G (решение пользователя 08.10.2026): Meta не приняла документы
для подтверждения компании (9.18), без него приложение не пройдёт проверку разрешения `email`.

#### Шаг 8. Общий OAuth-поток и Google
**🧑‍💻 Разработчик:** в Google Cloud → Google Auth Platform настроить Branding (название, логотип,
ссылки на `/privacy` и `/terms`), Audience (External) и Data access (`openid`, `email`,
`profile`). В Clients создать Web application: в Authorized JavaScript origins указать localhost
и прод-домен, в Authorized redirect URIs указать `https://<ref>.supabase.co/auth/v1/callback`.
Client ID и Secret внести в Supabase → Auth → Providers → Google. Пока приложение в статусе
Testing, войти могут только добавленные тестовые пользователи.

- [x] `GET /api/auth/sign-in`: белый список провайдеров, `signInWithOAuth` и 302 на провайдера.
      Подключён только Google (с `prompt=select_account`), Facebook и Telegram пока ведут
      на `/login?error=auth_unavailable`.
- [x] `GET /api/auth/callback`: `exchangeCodeForSession`, проверка `next`, маршрутизация
      (онбординг или страница), ошибки отправляем на `/login?error=…`: `access_denied`,
      `auth_expired` (нет PKCE-верификатора), `oauth_failed`.
- [x] `POST /api/auth/sign-out`, `GET /api/me` → `{ user, profile | null, suggestions }`.
      Подсказки — имя, фото и адрес страницы из данных провайдера.
- [x] `entities/viewer`: `useViewerQuery`, `useSignOutMutation`, гард приватных страниц
      (скелетон, пока идёт загрузка, затем редирект). `/onboarding` и `/settings` за гардом,
      вошедшего пользователя `/login` уводит дальше.
- [x] `widgets/sign-in-panel` (кнопки Google, Facebook, Telegram с логотипами), `views/login`
      с показом ошибок из `?error=`.
- [x] `widgets/header`: гость видит «Войти», пользователь видит меню (аватар, «Моя страница»,
      «Настройки», «Выйти»; без профиля — «Создать страницу»).
- [x] Cookies сессии `httpOnly`. Проверено на прод-сборке: редирект к Supabase с PKCE,
      все ветки ошибок, выход без сессии, open redirect через `next` отсекается.
- [x] Пройти вход и выход через Google на localhost, затем на проде. Google в Supabase уже
      включён: аудит проверил, что `/auth/v1/authorize` ведёт на Google. Пройдено 26.09.2026
      на localhost и на проде.
- [x] (аудит) На `/login` показывать только подключённых провайдеров: сейчас кнопки Facebook
      и Telegram на проде ведут на «Способ входа недоступен». Список подключённых провайдеров
      держать в одном месте для клиента и сервера. Сделано: `enabledAuthProviders`
      в `entities/viewer/config/auth-providers.ts` читают и `sign-in-panel`, и
      `getOAuthSignInUrl`.
- [x] **🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → Google → выключить
      Skip nonce check. Он нужен только для входа по ID-токену без nonce (iOS, One Tap),
      а проверку токенов ослабляет. Выключен 26.09.2026, проверено через Management API.
      С шага 8.1 вход по ID-токену есть, но мы передаём nonce, поэтому опция остаётся
      выключенной.

**Готово, когда:** вход и выход через Google работают на localhost и на проде, сессия
переживает перезагрузку страницы.

#### Шаг 8.1. Название сайта на экране Google
Сейчас на экране выбора аккаунта Google написано «Переход в приложение
`<ref>.supabase.co`». Название приложения Google показывает только после проверки бренда,
а до неё — домен адреса возврата. Подтвердить владение `supabase.co` нельзя, поэтому Google
возвращает браузер на наш домен (решение пользователя 26.09.2026). Свой домен для Supabase Auth
делает то же, но требует тариф Pro и дополнение Custom Domain (около $35 в месяц).

- [x] Код: `/api/auth/sign-in` при заданных `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` ведёт
      прямо на Google, `/api/auth/callback/google` проверяет `state`, меняет код на токены
      и создаёт сессию через `signInWithIdToken` (Supabase проверяет подпись, `aud` и `nonce`).
      Без переменных Google работает через OAuth Supabase, как раньше. Cookie
      `freudin-google-sign-in` добавлена в `/privacy`. Сделано 26.09.2026. Проверено на
      прод-сборке с фейковым клиентом: параметры запроса к Google, атрибуты cookie, отмена
      входа, чужой `state`, нет или испорчена cookie, отказ Google принять код. Запасной путь
      без переменных не изменился.
- [x] **🧑‍💻 Разработчик:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs:
      `https://www.freud.in/api/auth/callback/google` и
      `http://localhost:3000/api/auth/callback/google`. Старый адрес Supabase пока оставить.
      Проверено 26.09.2026: оба адреса Google уже принимает.
- [x] **🧑‍💻 Разработчик:** проверить вход на localhost (`GOOGLE_*` уже есть в `.env`): на экране
      Google виден `localhost`, после входа тот же аккаунт и профиль, что раньше.
- [x] **🧑‍💻 Разработчик:** задать `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в Vercel → Settings →
      Environment Variables (Production), закоммитить и проверить вход на проде: на экране
      Google должно быть `www.freud.in`. Проверено 26.09.2026: прод ведёт на Google
      с адресом возврата `https://www.freud.in/api/auth/callback/google`.
- [x] **🧑‍💻 Разработчик:** Google Search Console → добавить ресурс «Домен» `freud.in` и подтвердить
      его TXT-записью в DNS Timeweb. Аккаунт — тот же, что владеет проектом в Google Cloud.
- [x] **🧑‍💻 Разработчик:** Google Auth Platform → Branding: Authorized domains — только `freud.in`
      (убрать `<ref>.supabase.co`). Проверить, что заполнены название Freudin, домашняя
      страница, `/privacy`, `/terms` и контакты. Затем Verification Center → отправить бренд
      на проверку. **Сделано 26.09.2026:** «Your branding has been verified and is being shown
      to users», на экране Google и локально, и на проде написано Freudin.
- [x] **🤖 ИИ:** после перехода на прод сделать `GOOGLE_*` обязательными и убрать запасной путь
      Google через OAuth Supabase. Facebook и Telegram остаются на нём. Сделано 26.09.2026:
      `getOAuthSignInUrl` по типу не принимает Google, пункт о cookies `sb-…-code-verifier`
      убран из `/privacy` (без OAuth Supabase их сейчас никто не ставит).
- [x] **🧑‍💻 Разработчик:** Google Cloud → Clients → OAuth-клиент → Authorized redirect URIs: удалить
      `https://<ref>.supabase.co/auth/v1/callback`, он больше не нужен. В Supabase провайдер
      Google не выключать: по нему проверяются ID-токены. Удалён 26.09.2026: Google отвечает
      на этот адрес `redirect_uri_mismatch`.

**Готово, когда:** на экране выбора аккаунта Google написано «Freudin» (после проверки бренда),
а до неё — `www.freud.in`.

#### Инструкция: подтверждение `freud.in` в Google Search Console

Перенесена в `README.md`: «Вход через Google» → «Подтверждение домена в Google Search Console».

#### Шаг 9. Meta (Facebook Login)
**🧑‍💻 Разработчик:** приложение в Meta for Developers и провайдер Facebook в Supabase — по
инструкции ниже, после списка пунктов.

- [x] **9.1.** Страницы `/privacy` и `/terms` с разделом «Удаление данных». Они нужны Meta для
      Live-режима и Google для брендинга. Тексты перенесены в этап H (юридические требования).
- [x] **9.2.** Кнопка Facebook в `sign-in-panel`.
- [x] **9.3. 🧑‍💻 Разработчик:** приложение в Meta for Developers и провайдер Facebook в Supabase
      (пункты 1–6 инструкции ниже). Сделано 26.09.2026. Через Management API проверено:
      провайдер включён, Client ID задан.
- [x] **9.4.** Обновить `/privacy` и `/terms`: вход через Facebook и какие данные он передаёт. В
      список cookies вернуть `sb-…-code-verifier`: его ставит OAuth Supabase на время входа. В Meta
      for Developers указать Data Deletion Instructions URL
      `https://www.freud.in/privacy#account-and-data-deletion`. Сделано 26.09.2026. В Privacy новый
      раздел 1.2 о Facebook Login, Meta в разделах 6, 7 и 9 (там же — как отвязать Freudin в
      настройках Facebook), cookie `sb-…-code-verifier`. В Terms — раздел 3 «Account registration
      and sign-in» и Facebook в разделе 8.
- [x] **9.5.** Добавить `facebook` в `enabledAuthProviders`: тогда появится кнопка на `/login` и
      заработает `/api/auth/sign-in?provider=facebook`.
- [x] **9.6.** Понятное сообщение на `/login`, если Facebook не вернул email. Сделано: без email
      Supabase возвращает `Error getting user email from external provider`, `getOAuthErrorCode`
      превращает это в код `email_required`.
- [x] **9.7.** Фото Facebook: Supabase получает его размером 50×50. Первая попытка — менять `height`
      и `width` в ссылке — не сработала (проверено вживую 26.09.2026): ссылка подписана, фото
      осталось размытым. Сделано: `/api/auth/sign-in` передаёт в адресе возврата
      `provider=facebook`. После входа колбэк по токену Facebook из сессии берёт у Graph API
      (`/me/picture`) ссылку на фото 512×512, кладёт её в `user_metadata` (`avatar_url`,
      `picture`) и обновляет сессию, чтобы `/api/me` сразу её увидел. Заглушку без фото убирает.
- [x] **9.8. 🧑‍💻 Разработчик:** проверка на localhost (пункт 7 инструкции). 26.09.2026: на экране
      Facebook — «Freudin», при другой почте создаётся новый аккаунт, фото было размытым
      (исправлено пунктом выше).
- [x] **9.9. 🧑‍💻 Разработчик:** проверить фото ещё раз: выйти, снова войти через Facebook → Settings
      → «Use account photo» → фото должно быть чётким. Если нет — в Meta: App settings → Advanced →
      Security → Require app secret должен быть выключен (иначе Graph API требует
      `appsecret_proof`). Если не поможет, пришли строку «Facebook photo request failed» из лога.
      Проверено вживую 26.09.2026: фото чёткое.
- [x] **9.10. 🧑‍💻 Разработчик решает:** пускать ли пользователей Facebook без email. **Решено
      26.09.2026:** пускать, а в онбординге предлагать необязательное поле почты.
- [x] **9.11. 🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → Facebook →
      включить вход без email (в API — `external_facebook_email_optional`). Включён 26.09.2026,
      проверено через Management API.
- [x] **9.12.** Миграция `20260926164835_create_account_contacts.sql`: таблица `account_contacts`
      с контактной почтой. Это отдельная таблица, а не колонка `profiles`: профили читают все,
      а контакт — только владелец (RLS на select, insert, update и delete, у `anon` прав нет).
      Это не email аккаунта в Supabase Auth: адрес не подтверждается и не участвует
      в автоматическом связывании аккаунтов. Иначе, вписав чужую почту Google, можно было бы
      получить её аккаунт. Проверено в транзакции с откатом: RLS, `anon`, формат почты,
      каскадное удаление с пользователем, `updated_at`.
- [x] **9.13. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Сделано 26.09.2026.
- [x] **9.14. 🤖 ИИ:** контактная почта в интерфейсе, после миграции:
      - `npm run db:types`;
      - zod-схема `contactEmailSchema`;
      - сохранение вместе с профилем в онбординге и изменение в настройках;
      - `/api/me` отдаёт контакт владельцу;
      - поле «Email (optional)» в онбординге и настройках, только если у аккаунта нет email
        от провайдера;
      - `/privacy` и `/terms`, README и AGENTS.md.

      Сделано 26.09.2026: `contactEmailSchema` в `profileInputSchema`. Сервер сохраняет почту
      до профиля (`upsert`), пустая строка её удаляет. `/api/me` отдаёт `user.contactEmail`.
      Кеш `/api/me` обновляют мутации профиля. Черновик онбординга без нового поля дополняется
      значениями по умолчанию. В Privacy — контактная почта в разделах 1.2, 1.3 и 9.
      Проверено:
      - SQL `upsert` и `delete` под ролью пользователя в транзакции с откатом;
      - в браузере на прод-сборке с подменёнными ответами API: поле есть только без email,
        ошибка формата, в `POST` уходит почта без пробелов, в настройках `PATCH` отправляет
        только `contactEmail`, очистка отправляет `""`, «Save» неактивна без изменений.
- [x] **9.15.** ~~Живая проверка контактной почты~~ — перенесено в шаг 19.2 (28.09.2026) как
      сценарий «Facebook без email».
- [x] **9.16.** Приложение Meta пересоздано 27.09.2026: в первом был лишний сценарий рекламы (Meta
      Ads Manager), а удалить сценарий из приложения нельзя. В новом — только Facebook Login. Но и
      оно при публикации требует бизнес-портфель и подтверждение компании (Business verification):
      приложение получает данные людей, которые ему не принадлежат.
- [x] **9.17.** Реквизиты ИП в подвале сайта (`legalConfig`: название, идентификационный номер,
      страна): Meta сверяет название компании с сайтом. Юридический адрес на сайт не выносим: это
      домашний адрес.
- [x] **9.18.** ~~Бизнес-портфель и подтверждение компании~~ — на паузе и перенесено в этап G
      (08.10.2026): Meta не приняла документы. Подробности — «Вход через Facebook» в этапе G.
- [x] **9.19.** 28.09.2026: вход через Facebook отвечал «Приложение неактивно» и на проде, и на
      localhost: в Supabase оставался App ID удалённого первого приложения. Пользователь внёс App ID
      и App secret нового приложения (`1765940065538299`, проверено через Management API) и добавил
      в use case разрешения `public_profile` и `email` и адрес возврата Supabase. Вход работает.
      Диалог Facebook показывает людям с ролью «Submit for Login Review»: `email` не одобрен для
      этого приложения. В режиме Development это не мешает.
- [x] **9.20.** ~~Статус разрешения `email` в App Review~~ — перенесено в этап G вместе с 9.18
      (08.10.2026).
- [x] **9.21. 🧑‍💻 Разработчик:** проверить вход на проде и перевести приложение в Live (пункт 8
      инструкции) после 9.18 и 9.20. Для Live нужна иконка приложения 1024×1024: готова,
      `docs/brand/meta-app-icon-1024.png` (шаг 17.3), загрузить в Settings → Basic → App icon.
      Сделано пользователем 29.09.2026, раньше 9.18 и 9.20.

**Скрыт 08.10.2026:** `facebook` убран из `enabledAuthProviders`, кнопки на `/login` и Connect
в настройках нет, `/api/auth/sign-in?provider=facebook` отправляет на `auth_unavailable`.
С 11.10.2026 (просьба пользователя) Facebook не виден в настройках, даже привязанный;
последним способом входа он не считается — `DELETE /api/auth/identities/[provider]`
не даст отвязать единственный Google или Telegram, если рядом только Facebook. Проверено пользователем 11.10.2026:
Facebook в Account → Sign-in methods не виден. Код входа остался: вернуть
вход — добавить `facebook` в `enabledAuthProviders` (этап G).

**Готово, когда:** вход через Facebook работает для тестировщиков приложения. Для всех
пользователей он заработает после перевода приложения в Live (шаг 9.21). Перевести его можно
сразу после проверки на проде: тексты `/privacy` и `/terms` к этому моменту уже будут
описывать Facebook.

#### Инструкция: приложение Meta для входа через Facebook

Перенесена в `README.md`, раздел «Вход через Facebook». Пункты шага 9 выше ссылаются на прежнюю
нумерацию: 1–6 — приложение Meta и провайдер в Supabase, 7 — проверка в режиме Development,
8 — Live. В README добавлен пункт про Require app secret, поэтому номера там сдвинулись.

#### Шаг 10. Telegram
**🧑‍💻 Разработчик:** в @BotFather выполнить `/newbot` (лучше отдельный бот для сайта), затем
открыть mini app BotFather → бот → Login Widget → «Switch to OpenID Connect Login».
Переключение **необратимо**. BotFather покажет Client ID и Client Secret (это не токен бота).
В Redirect URI указать `https://<ref>.supabase.co/auth/v1/callback`, при необходимости добавить
домены сайта в Trusted origins. **Сделано 27.09.2026:** бот `@freudin_bot`, Redirect URIs —
адрес Supabase, Trusted Origins — `https://www.freud.in`.

- [x] Провайдер в Supabase → Auth → Providers → New Provider → Auto-discovery (OIDC):
      `custom:telegram`, issuer `https://oauth.telegram.org`, scopes `openid profile`, email
      optional. Можешь сделать ты, или я сделаю через коннектор/admin API. Сделал пользователь
      27.09.2026. Через admin API (`/auth/v1/admin/custom-providers`) проверено: провайдер
      включён, PKCE и `email_optional` включены. Цепочка `/api/auth/sign-in?provider=telegram`
      → Supabase → `oauth.telegram.org` открывает экран входа бота без ошибок.
- [x] Кнопка Telegram.
- [x] Обновить `/privacy` и `/terms`: вход через Telegram и какие данные он передаёт. В список
      cookies вернуть `sb-…-code-verifier`, если его ещё нет: его ставит OAuth Supabase на время
      входа. Сделано 27.09.2026: в Privacy новый раздел 1.3 о Telegram Login (следующие
      разделы сдвинулись до 1.7), Telegram в разделах 2, 3, 6, 7, 9, 10 и 13 (в разделе 9 —
      как отвязать сайт и как запросить удаление без email). В Terms — раздел 3 и список
      в разделе 8. Дата «Last updated» — September 27, 2026.
- [x] Добавить `telegram` в `enabledAuthProviders`. Маппинг `telegram` → `custom:telegram`
      в `auth.server.ts` уже есть.
- [x] Приведение метаданных провайдеров к единому виду: имя, аватар, подсказка username.
      У Telegram — `preferred_username`, у Google и Facebook — транслит имени (`anna-smirnova`).
      (аудит) Часть email до `@` — только запасной вариант: сейчас подсказка берётся из email,
      и публичный адрес выдаёт логин почты (`ivan.petrov1987@…` → `ivanpetrov1987`).
      Сделано 27.09.2026: `getProfileSuggestions` берёт первый допустимый адрес из username
      провайдера, имени латиницей (`transliterate` в `shared/lib`: кириллица ru/uk/be
      и диакритика) и части email до «@». Имя и фото Telegram (`name`, `picture`) читались
      и раньше, хосты фото Telegram уже разрешены в `fetchProviderAvatar`.
- [x] Свой адрес возврата, как у Google (решение пользователя 27.09.2026): через OAuth Supabase
      на экране Telegram было «log in on `<ref>.supabase.co`». Своё название вместо домена Telegram
      не показывает, только домен адреса возврата и бота. Сделано 27.09.2026:
      - **Сделал пользователь:** Redirect URIs в BotFather —
        `https://www.freud.in/api/auth/callback/telegram` (адрес с `http://localhost` BotFather
        не принимает), `TELEGRAM_CLIENT_ID` и `TELEGRAM_CLIENT_SECRET` в `.env` и Vercel;
      - вход Google переписан в общий модуль `oidc-sign-in.server.ts` (настройки на провайдера:
        адреса, scopes, способ передачи секрета), колбэк `/api/auth/callback/google` стал
        динамическим `/api/auth/callback/[provider]`, адрес у Google не изменился;
      - Telegram: секрет в заголовке Basic, ошибки токен-эндпоинт отдаёт со статусом 200 (ответ
        разбирается по полям), nonce передаётся в Supabase, только если он есть в ID-токене;
      - на `http://` (localhost) Telegram входит через OAuth Supabase: аккаунт тот же, Client ID
        общий. Cookie попытки входа `freudin-telegram-sign-in` добавлена в Privacy.

      Проверено на прод-сборке: у Google параметры экрана входа прежние; экран Telegram
      с адресом возврата `www.freud.in` открывается с origin `https://www.freud.in`; колбэк
      на неизвестный провайдер, без cookie, с чужим `state`, с отменой у провайдера и с неверным
      кодом отправляет на `/login` с нужной ошибкой. Настоящий обмен кода и `signInWithIdToken`
      для `custom:telegram` проверяются только живым входом на проде.
- [x] **🧑‍💻 Разработчик:** закоммитить, дождаться деплоя и проверить на `www.freud.in`:
      - на экране Telegram — `www.freud.in`;
      - Continue with Telegram → подтвердить вход в Telegram → онбординг: имя и адрес
        предзаполнены, «Use account photo» ставит фото, есть поле «Email (optional)»;
      - выйти и войти снова — тот же профиль, в Settings «Signed in with: Telegram»;
      - вход через Google работает как раньше (его код переписан);
      - есть ли Freudin в Telegram → Settings → Privacy and Security → Active Websites: так
        в Privacy описано, как отвязать сайт;
      - при ошибке — `?error=` из адреса `/login` и строки из логов Vercel (Logs, фильтр
        `rejected` или `sign-in`).

      Проверено пользователем на проде 27.09.2026: на экране Telegram `www.freud.in`, онбординг
      с предзаполненными именем, адресом и фото и полем «Email (optional)», повторный вход
      в тот же профиль, вход через Google работает. В Telegram → Settings → Privacy and Security
      сайт среди подключённых не появляется: у входа через OpenID Connect нет постоянной связи.
      Текст Privacy (раздел 9) исправлен: данные Telegram приходят только при входе, чтобы
      прекратить передачу — не входить через Telegram или удалить аккаунт.

**Готово, когда:** вход через Telegram создаёт пользователя без email и ведёт на онбординг.
✅ Готово 27.09.2026.

**Запасной план:** если связка Telegram OIDC + Supabase не заработает, используем Telegram Login
SDK на клиенте, проверяем `id_token` по JWKS в `POST /api/auth/telegram` и создаём сессию через
admin API.

#### Шаг 10.1. Apple (Sign in with Apple)
Перенесён в этап G 28.09.2026: разработчик пока не платит $99 в год за Apple Developer Program,
поэтому MVP обходится без Apple. План — в этапе G, раздел «Вход через Apple (бывший шаг 10.1)».

#### Шаг 10.2. Несколько способов входа в одном аккаунте
Сейчас один способ входа — один аккаунт (решение 9). Пользователь вошёл через Google, потом
нажал «Continue with Apple» — и получил второй, пустой аккаунт. Исключение — одинаковый
подтверждённый email: такие аккаунты Supabase объединяет сам. Но у Telegram email нет, а Apple
часто отдаёт адрес-пересыльщик, поэтому нужна ручная привязка в настройках (решение
пользователя 26.09.2026). Шаг имеет смысл, когда подключено хотя бы два провайдера
(шаги 9, 10, 10.1).

Привязка — это `linkIdentity` в Supabase: новый способ входа добавляется к текущему
пользователю, и дальше войти можно любым из привязанных. Установленная версия `@supabase/auth-js`
умеет это и через OAuth, и по ID-токену, поэтому Google со своей схемой входа (шаг 8.1) тоже
привязывается.

```
/settings → [Connect Apple]
  → POST /api/auth/identities { provider }        сессия и проверка same-origin
      Facebook, Telegram, Apple: linkIdentity({ provider, skipBrowserRedirect }) → { url }
      Google: cookie попытки входа с mode: "link" → { url } на accounts.google.com
  → браузер уходит к провайдеру и возвращается:
      /api/auth/callback?code=…   → exchangeCodeForSession
      /api/auth/callback/google   → linkIdentity({ provider: "google", token, access_token, nonce })
  → 302 на /settings?linked=apple  или  /settings?error=identity_already_exists
```

- [x] **🧑‍💻 Разработчик:** Supabase → Authentication → Sign In / Providers → включить Allow manual
      linking. На проде и на стенде (шаг 18.9). Прод — включено 27.09.2026, проверено через
      Management API (`security_manual_linking_enabled`). Решения из этого шага пользователь
      подтвердил 27.09.2026.
- [x] API:
      - `POST /api/auth/identities` с `{ provider }` → `{ url }`: старт привязки. Это POST,
        а не ссылка, чтобы чужой сайт не мог запустить привязку (защита от CSRF
        в `withErrorHandling`). Уже привязанный провайдер — 409;
      - колбэки отличают привязку от входа. Для OAuth Supabase — по адресу возврата, для
        Google — по `mode: "link"` в cookie попытки входа: вместо `signInWithIdToken`
        вызывается `linkIdentity` по ID-токену;
      - `DELETE /api/auth/identities/[provider]` — отвязка (`unlinkIdentity`). Последний способ
        входа отвязать нельзя — 409;
      - `GET /api/me` отдаёт список привязанных способов (`user.identities`: провайдер
        и email) вместо одного `user.provider`.

      Сделано 27.09.2026. Отличия от задуманного: список в `/api/me` называется
      `user.signInMethods` (провайдер, email или `@username` у Telegram, фото), его читает
      `getLinkedIdentities` через `auth.getUser()`. OAuth Supabase отмечает привязку
      `?mode=link` в адресе возврата, Google и Telegram на https — `linkUserId` в cookie
      попытки входа; привязка идёт, только если сессия принадлежит тому, кто её начал.
      Отвязка отвечает оставшимися способами и обновляет сессию.
- [x] Ошибки:
      - способ входа уже привязан к другому аккаунту Freudin (`identity_already_exists`) —
        понятное сообщение в настройках. Объединять два аккаунта с профилями не умеем: чтобы
        перенести способ входа, пользователь входит во второй аккаунт и удаляет его;
      - отмена у провайдера — просто возврат в настройки без ошибки.

      Сделано: коды `identity_already_exists` и `link_failed` в `auth-errors.ts`, колбэки
      отдают их в `/settings?link_error=`. Найдена дыра: у второго аккаунта может не быть
      страницы, тогда он попадает на онбординг, где удалить аккаунт было нельзя. Добавлено:
      на онбординге «Signed in with the wrong account?» и Delete account без ввода username,
      `DELETE /api/me` у аккаунта без профиля подтверждения не требует.
- [x] UI в `/settings` → Account, блок «Sign-in methods»: все провайдеры из
      `enabledAuthProviders`. У привязанных — email и кнопка «Disconnect» (неактивна, если
      способ последний), у остальных — «Connect …». После возврата — тост «Apple connected».
      Ожидание на кнопке — как у входа (шаг 17.9). Сделано: логотипы (`AuthProviderIcon`
      перенесён в `entities/viewer`), «Redirecting…» и «Disconnecting…» на кнопках, сброс
      ожидания при возврате из bfcache, подсказка под списком, когда способ один.
- [x] Фото и имя из аккаунта: «Use account photo» и подсказки онбординга берут данные
      конкретного провайдера (`identity_data`), а не общий `user_metadata`. Если фото есть
      у нескольких провайдеров, пользователь выбирает, чьё. Сделано для фото: при нескольких —
      меню «Google photo», «Telegram photo»; `POST /api/profile/avatar` принимает `provider`.
      Крупное фото Facebook — в `user_metadata.facebook_avatar_url` (у аккаунтов, вошедших
      через Facebook до 27.09.2026, до следующего входа будет фото 50×50). Подсказки имени
      и адреса на онбординге остались из `user_metadata`: до создания страницы привязать
      второй способ нельзя, и там данные одного провайдера.
- [x] Удаление аккаунта удаляет все привязанные способы — проверить. Проверено пользователем
      на проде 28.09.2026: после удаления аккаунта с несколькими способами вход любым из них
      создаёт новый пустой аккаунт. Отзыв токена Apple (этап G, «Вход через Apple») делать для
      каждой привязки Apple.
- [x] Документы:
      - `/privacy` и `/terms`: к аккаунту можно привязать несколько способов входа, каждый
        передаёт данные, как описано в его разделе, отвязка — в Settings;
      - README и AGENTS.md: роуты, тип `Viewer`, правило про провайдеры.

      Сделано: Privacy 1.4 (несколько способов, после отвязки имя и фото могут остаться до
      удаления аккаунта) и 9 (удаление на онбординге, удаляются все способы входа), Terms 3.
- [x] **🧑‍💻 Разработчик:** проверка сценариев на `www.freud.in` (Apple пока не подключён, поэтому
      Google, Facebook и Telegram):
      - вход через Google → Connect Telegram → тост «Telegram connected» → выйти → войти через
        Telegram → тот же профиль;
      - Connect Facebook (приложение Meta не в Live: получится только у аккаунта с ролью);
      - отвязать способ; убедиться, что последний отвязать нельзя;
      - привязать второй аккаунт Telegram, у которого уже есть свой профиль Freudin, —
        понятная ошибка;
      - отмена у провайдера — возврат в настройки без ошибки;
      - «Use account photo» при нескольких фото — выбор провайдера;
      - удалить тестовый аккаунт с несколькими способами → вход любым из них создаёт новый
        пустой аккаунт; на онбординге этого аккаунта — «Delete account» без ввода username.

      Проверено мной 27.09.2026 на прод-сборке: без сессии роуты привязки отвечают 401,
      с чужого сайта — 403; колбэки в режиме привязки при отмене возвращают в `/settings`
      без ошибки, при `identity_already_exists` — с этим кодом, при чужой сессии или неверном
      `state` — с `link_failed`; обычный вход не изменился. В браузере с подменёнными ответами
      API: список способов, Connect уводит на адрес провайдера, Disconnect и неактивная кнопка
      у последнего способа, тосты по `?linked=` и `?link_error=` с очисткой адреса, меню фото
      и тело `POST /api/profile/avatar`, фото по умолчанию и удаление аккаунта на онбординге.
      Настоящую привязку через провайдеров проверяешь ты.

      Проверено пользователем на проде 28.09.2026: Connect и Disconnect, привязка чужого
      аккаунта, отмена у провайдера, выбор фото и удаление аккаунта работают. В Supabase видны
      аккаунты с несколькими способами входа.

**Готово, когда:** к одному аккаунту можно привязать и отвязать любой подключённый способ
входа, войти любым из них и попасть в тот же профиль, а последний способ отвязать нельзя.
✅ Готово 28.09.2026.

### Этап D. Профиль

#### Шаг 11. Сущности и API профиля
- [x] `entities/social-link`: справочник платформ (Telegram, Instagram, Facebook, VK, X, YouTube,
      TikTok, LinkedIn, Threads, «Сайт»). Для каждой платформы: название, допустимые домены,
      нормализация `@handle` → URL, zod-схема, кнопка ссылки. Иконок нет (решение 11).
- [x] `entities/profile`: типы, zod-схемы (общие для формы и API), правила username,
      `profileQueries.detail`, `ProfileAvatar`. Зарезервированные имена лежат
      в `shared/config/reserved-usernames.ts`: служебные слова и сегменты всех роутов из `routes`.
- [x] `entities/profile`: проверка доступности username (`usernameQueries`), серверные функции
      БД в `index.server.ts`: чтение по username, проверка username, создание и обновление.
      Мутации создания и обновления лежат в `entities/viewer`: они обновляют кеш `/api/me`,
      а `viewer` уже зависит от `profile` через `@x` (обратный импорт дал бы цикл).
- [x] Роуты `POST /api/profile`, `PATCH /api/profile` (только переданные поля),
      `GET /api/profiles/[username]`, `GET /api/usernames/[username]`. Публичные роуты читают
      через клиент без сессии `createSupabasePublicClient()`. Демо-профиль `demo` отдаётся из кода.
- [x] Пройти создание и обновление профиля с настоящей сессией (после включения Google, шаг 8).
      Из облачной сессии проверены чтение, 404, 400 и 401. 26.09.2026 вживую проверены
      создание (онбординг новым аккаунтом) и обновление: имя, адрес, соцсети.

**Готово, когда:** профиль создаётся, читается и обновляется через API. Невалидные данные дают 400
с ошибками по полям, занятый username даёт 409.

#### Шаг 12. Фото профиля
- [x] `POST /api/profile/avatar`: multipart, jpeg/png/webp, не больше 2 МБ. Формат проверяется
      по сигнатуре файла, а не по заголовку. Файл сохраняется в `avatars/<user_id>/<uuid>.<ext>`
      (расширение по формату), старый удаляется. `DELETE /api/profile/avatar`.
- [x] Клиент: выбор файла, кроп 1:1 (`react-easy-crop`, масштаб слайдером), сжатие до 512×512
      через canvas: WebP, а где браузер его не кодирует — JPEG.
- [x] Кнопка «Взять фото из аккаунта»: `POST /api/profile/avatar` с JSON `{ "source": "provider" }`.
      Сервер берёт адрес фото из данных провайдера в сессии (не из запроса), скачивает его только
      с хостов провайдеров (в том числе при редиректах), с таймаутом и лимитом 2 МБ, и сохраняет
      в Storage. У Google запрашиваем 512 px вместо 96.
- [x] ~~`next.config.ts`: `images.remotePatterns`~~ — не нужно: фото показывает `Avatar`
      из shadcn обычным `<img>`, а не `next/image`.
- [x] Пройти загрузку, копирование фото провайдера и удаление с настоящей сессией (после шага 8).
      Пройдено вживую 26.09.2026: загрузка, кроп, «Взять фото из аккаунта», «Убрать фото».
      Локально превью фото Google падало с 429: Google ограничивает запросы с `Referer`
      от `localhost`. Исправлено: `ProfileAvatar` грузит фото с `referrerPolicy="no-referrer"`,
      проверено локально.
- [x] (аудит) Ограничить размеры фото на сервере: прямым запросом к API в обход кропа можно
      загрузить PNG до 2 МБ любых размеров (например, 20000×20000), и его будет открывать браузер
      каждого посетителя. Варианты: перекодировать фото через `sharp` (заодно уберёт EXIF)
      или хотя бы проверять размеры по заголовку файла. Сделано без зависимостей: размеры читаются
      из заголовка PNG, JPEG и WebP (`lib/read-image-size.ts`), больше 1024×1024 — 400. Проверено
      на восьми сгенерированных файлах, включая PNG 20000×20000 весом 1,2 МБ.

#### Шаг 13. Онбординг (регистрация профиля)
- [x] Установить `@tanstack/react-form` и `zustand` (через npm 11).
- [x] `widgets/profile-form` (TanStack Form + zod + shadcn `Field`). Поля: фото, имя, ссылка
      `<домен>/<username>` с проверкой доступности (debounce 400 мс), описание со счётчиком
      символов, соцсети (добавить или удалить, выбрать платформу). Ошибки сервера по полям
      (400, 409) показываются у полей. Форма готова и для настроек (шаг 15): `currentUsername`,
      `currentAvatarUrl`.
- [x] ~~Живое превью карточки~~ — сначала перенесено в этап G (28.09.2026), затем согласовано
      для онбординга и настроек в отдельном шаге 40 (01.10.2026); сделано там же.
- [x] Предзаполнение полей из данных провайдера: имя, адрес страницы и фото.
- [x] Zustand: черновик онбординга (`persist` в sessionStorage), чтобы ввод не терялся
      при перезагрузке. Черновик привязан к пользователю, фото в нём не хранится.
- [x] `views/onboarding`: гостя отправляем на `/login`, пользователя с профилем — на его
      страницу `/<username>` (а не на `/settings`: так после создания профиля гард сам ведёт
      на новую страницу). Профиль и фото сохраняются одной мутацией, затем тост «Страница готова»
      с кнопкой «Скопировать ссылку». Если фото не загрузилось, страница всё равно создаётся.
- [x] Пройти онбординг с настоящей сессией (после шага 8). Из облачной сессии сценарий проверен
      в браузере на прод-сборке с подменёнными ответами API. Пройдено вживую 26.09.2026.
- [x] (аудит) Если профиль уже создан (409 «Страница уже создана»: например, ответ на первую
      отправку не дошёл), перезапрашивать `/api/me`, чтобы гард увёл на страницу. Сейчас
      пользователь остаётся на онбординге до перезагрузки. Сделано: `useCreateProfileMutation`
      инвалидирует `/api/me` при 409 без `fields.username`.
- [x] (аудит) Показывать «Адрес свободен», когда проверка адреса прошла. Проверено вживую
      26.09.2026.

#### Шаг 14. Публичная страница `/<username>`
- [x] `widgets/profile-card` + `views/profile`: фото (или инициалы), имя, описание с переносами
      строк, кнопки соцсетей во всю ширину. Кнопка «Поделиться» (Web Share API, иначе
      копирование ссылки).
- [x] Владелец видит кнопку «Редактировать» (ведёт на `/settings`): его профиль из `useViewerQuery`
      совпадает с открытой страницей.
- [x] Состояния: скелетон при загрузке, 404, ошибка с кнопкой «Повторить».
- [x] Заголовок вкладки = имя пользователя.
- [x] (аудит) Баг: после ухода со страницы профиля заголовок вкладки становится «Freudin»
      вместо заголовка новой страницы (проверено на `/privacy` и главной). Причина: при
      размонтировании профиль перезаписывает `document.title`, который уже выставил Next.
      Исправлено: профиль возвращает прежний заголовок, только если он ещё свой.
- [x] (аудит) Кнопки соцсетей подписаны только платформой: две ссылки «Сайт» неотличимы,
      ника не видно. Показывать ник или домен: `Telegram · @anna`, `example.com`.
- [x] (аудит) Адрес в другом регистре (`/Anna`) открывается, но не заменяется на `/anna`:
      дубли страницы и отдельные записи в кеше. Заменять адрес на канонический. Сделано:
      запрос идёт по адресу в нижнем регистре, строка адреса меняется через `history.replaceState`.
      Пункты шага 14 проверены headless Chromium на прод-сборке: `/Demo` → `/demo`, заголовки
      вкладки при переходах и «Назад», подписи ссылок.

#### Шаг 15. Настройки и управление аккаунтом
- [x] `views/settings`: `profile-form` в режиме редактирования. При смене username под полем
      предупреждаем, что старая ссылка перестанет работать. В `PATCH /api/profile` уходят только
      изменённые поля (`getProfileChanges` сравнивает нормализованные значения), фото меняется
      или удаляется отдельными запросами. Без изменений запросов нет. После сохранения форма
      берёт начальные значения из обновлённого профиля.
- [x] `widgets/account-settings`: способ входа (провайдер из `app_metadata` и email), «Выйти»,
      «Удалить аккаунт» (AlertDialog с подтверждением) → `DELETE /api/me`. Сначала удаляются
      файлы из Storage, затем пользователь через admin API; профиль удаляется каскадно, cookies
      сессии очищаются. После удаления страница перезагружается на главную.
- [x] Пройти редактирование и удаление аккаунта с настоящей сессией (после шага 8). Из облачной
      сессии сценарии проверены в браузере на прод-сборке с подменёнными ответами API.
      Пройдено вживую 26.09.2026.
- [x] (аудит) Баг: «Сохранить» без изменений показывает «Изменения сохранены», хотя запросов
      не было. Кнопка неактивна, пока в форме и фото нет изменений. Проверено вживую 26.09.2026:
      кнопка неактивна без изменений, `t.me/anna` → `@anna` даёт «Изменений нет».
- [x] (аудит) Предупреждать о несохранённых изменениях при уходе со страницы настроек. Закрытие
      и перезагрузка вкладки — окно браузера, ссылки сайта — `confirm`; «Назад» не перехватывается.
      Проверено вживую 26.09.2026.
- [x] (аудит) Удаление аккаунта: если удаление пользователя упадёт после удаления файлов,
      в профиле останется ссылка на удалённое фото. Сначала обнулять `avatar_path` или удалять
      пользователя первым, а файлы — после. Сделано: `removeUserAvatarFiles` сначала обнуляет
      `avatar_path`.
- [x] Подтверждение удаления вводом username (решение пользователя 26.09.2026). В диалоге
      «Delete account?» есть поле «Type `anna` to confirm», и кнопка «Delete» неактивна,
      пока введённое значение не совпадёт с username:
      - сравниваем без пробелов по краям и без учёта регистра;
      - вставка из буфера разрешена;
      - у поля есть подпись (`label`), `autoComplete="off"`, `spellCheck={false}`
        и `autoCapitalize="none"`, при открытии диалога фокус в поле;
      - Enter удаляет аккаунт только при совпадении;
      - при закрытии диалога поле очищается;
      - пока идёт удаление, поле и кнопки неактивны.

      `/settings` открыт только пользователям с профилем, поэтому username есть всегда.
      Сервер тоже проверяет подтверждение: `DELETE /api/me` принимает `{ "username": "…" }`
      и без совпадения с текущим профилем отвечает 400. Это страхует от случайного вызова API.

      Сделано 27.09.2026: `DeleteAccountDialog` в `widgets/account-settings`, сравнение —
      `isAccountDeletionConfirmed`, схема тела — `deleteAccountInputSchema` (обе в
      `entities/viewer`). Пользователь без профиля удалить аккаунт через API не может: подтвердить
      нечем, остаётся запрос на почту поддержки (Privacy, раздел 9). Escape и клик мимо диалога
      во время удаления его не закрывают. Проверено в headless Chromium на прод-сборке
      с подменёнными ответами API: фокус в поле, Enter без совпадения ничего не отправляет,
      `  ANNA ` подходит, вставка работает, поле очищается после закрытия, в `DELETE` уходит
      `{"username":"anna"}`, после ошибки значение остаётся, во время удаления всё неактивно,
      после 204 — переход на главную; 320 px в тёмной теме с длинным username без горизонтальной
      прокрутки.

#### Шаг 20. Данные психолога в личном кабинете
Решение пользователя 28.09.2026: в настройках появляются страна, подход в психологии, формат работы
(онлайн или офлайн; для офлайна нужен город), языки и изображения документов. По решениям 20.2
добавлены «С кем работает» и стоимость сессии, а город выбирается из справочника. Это новые
персональные данные, поэтому меняются `/privacy` и `/terms` (правило 11 `docs/workflows/process.md`).

- [x] **20.1. 🤖 ИИ:** предложить справочники и правила полей. Итог с учётом решений 20.2:
      - **Подходы** — до 5 из закрытого списка в коде (id и английская подпись, как платформы
        в `social-link`). В списке распространённые в практике подходы с исследованиями
        эффективности; гипноз, НЛП, расстановки и подобное не берём. Варианта «Other» нет:
        подробности психолог пишет в описании. Список из 10 пунктов: Cognitive behavioral therapy
        (CBT), Acceptance and commitment therapy (ACT), Schema therapy, EMDR, Psychodynamic
        therapy, Psychoanalysis, Gestalt therapy, Person-centered therapy, Systemic family therapy,
        Emotion-focused therapy (EFT). БД проверяет только формат и количество значений, поэтому
        список меняется без миграции.
      - **С кем работает** — несколько из списка: Individuals, Couples, Teens, Groups.
      - **Формат работы** — Online и In person (офлайн), можно оба или ни одного. Для In person
        обязательны страна и город.
      - **Страна** — одна, код ISO 3166-1 alpha-2 (`GE`). Список кодов лежит в коде, английские
        названия даёт `Intl.DisplayNames`.
      - **Город** — из справочника и только в выбранной стране. Справочник — таблица `cities`
        в нашей базе с данными GeoNames (лицензия CC BY 4.0, нужна ссылка на источник): внешних
        сервисов, ключей и передачи данных третьим лицам нет. Набор `cities5000` — города от 5000
        жителей и административные центры, без районов городов и исторических мест. Это около
        64 тыс. строк, в Грузии 58: есть Боржоми и Мцхета, которых нет в наборе от 15 000 жителей.
        Названия английские: Tbilisi, Moscow, Munich, Köln. Внутри одной страны около 2 тыс.
        одноимённых городов, поэтому в подсказке виден регион: Portland, Oregon. Поиск идёт по
        началу названия без учёта регистра, диакритики и апострофов (`zurich` находит Zürich),
        выдаёт до 10 городов по убыванию населения. Данные попадают в базу миграцией, которую
        собирает скрипт из выгрузки GeoNames: так справочник появится и в тестовой базе
        (шаг 18.9) обычным `db:push`.
      - **Языки** — до 5, коды ISO 639-1 (`ru`, `ka`), названия даёт `Intl.DisplayNames`.
        В списке 128 живых языков ISO 639-1: мёртвых и искусственных (латынь, санскрит,
        эсперанто) нет. 45 языков убраны 28.09.2026 после проверки на проде (20.8): в Chrome
        урезаны данные ICU, и вместо названия он показывал код (`aa`, `ab`, `av`, `ba`).
        Остались языки, которые называют Chrome, Safari и Firefox.
      - **Цена** — необязательная: целая сумма от 1 до 100 000 000 и валюта ISO 4217 (155
        действующих кодов, названия даёт `Intl.DisplayNames`). Смысл — «от … за сессию»,
        на странице: `From $60 per session`. Сумма и валюта указываются только вместе.
      - **Документы** — до 5 изображений JPEG, PNG или WebP. PDF не принимаем, вместо него можно
        загрузить скриншот. У каждого документа обязательная подпись до 100 символов, она же
        `alt`: например, «MA in Clinical Psychology, Tbilisi State University». На клиенте
        картинка уменьшается до 2048 px по длинной стороне и перекодируется через canvas в WebP
        или JPEG, заодно удаляются EXIF. Сервер проверяет формат по сигнатуре, размер до 2 МБ и
        стороны до 2048 px. Документ загружается и удаляется сразу, без кнопки Save формы.
        Подпись меняется только повторной загрузкой. Под полем предупреждаем, что документы
        видны всем и номера документов лучше закрыть. К каждому документу сохраняется превью
        до 480 px (решение пользователя 28.09.2026): его показывает страница, полное изображение —
        только просмотр.
      - Страну, город, языки и валюту выбирают из списка с поиском, подходы и «С кем работает» —
        галочками. Список с поиском собираем из компонентов shadcn `popover` и `command`, это
        новая зависимость `cmdk` (около 5 КБ). Готовый `combobox` shadcn для Radix не берём: он
        тянет вторую библиотеку примитивов `@base-ui/react`.
      - **Хранение** — публичные колонки `profiles` (их читает `anon`): `country`, `city_id`
        (ссылка на `cities`, город той же страны), `work_formats`, `client_types`, `approaches`,
        `languages`, `price_amount`, `price_currency` и `documents` — jsonb-массив
        `{ id, path, title, width, height }`, как `social_links`. Отдельная таблица документов
        не подошла: гость не видит `profiles.id`, и связь документов с профилем по ней дала бы
        `permission denied`. Публичный bucket `documents`, путь `<user_id>/<uuid>.<ext>`. При
        удалении аккаунта файлы документов удаляются так же, как фото.
- [x] **20.2. 🧑‍💻 Разработчик решает:** решения пользователя 28.09.2026:
      - подходы — 10 самых распространённых, современных и с научной базой (гештальт подходит,
        гипноз и «квантовая психология» — нет); лимиты: 5 подходов, 5 языков, 5 документов;
      - новое поле «С кем работает»: индивидуально, пары, подростки, группы;
      - все поля необязательны и заполняются только в настройках, онбординг не меняется;
      - документы видны всем сразу, без модерации: в `/terms` пользователь подтверждает, что
        документы его и настоящие, а по жалобе мы их удаляем; значок Verified — этап G;
      - город — сразу из справочника;
      - языки показываем на странице пользователя, в поиске (шаг 22) будет фильтр по языку;
      - новое необязательное поле — стоимость сессии; стаж не нужен (пересмотрено 29.09.2026:
        дата начала практики, шаг 29);
      - список из 10 подходов (20.1) и формат цены «от … за сессию» подтверждены.
- [x] **20.3. 🤖 ИИ:** миграции: таблица `cities` с данными GeoNames (скрипт сборки миграции
      в `scripts/`), новые колонки `profiles` с CHECK-ограничениями как в zod (документы —
      jsonb-колонка), bucket `documents` с политиками, права `anon` на новые публичные колонки
      и `cities`, индексы для поиска (шаг 22). Проверка в транзакции с откатом.

      Сделано 28.09.2026: `*_create_cities.sql`, `*_seed_cities.sql` (64 430 городов, собрана
      `scripts/generate-cities-migration.mjs`), `*_add_psychologist_profile_fields.sql`,
      `*_create_documents_bucket.sql`. На боевой базе в транзакции с откатом проверено:
      корректное заполнение проходит, 28 неверных значений отклоняются (в том числе элемент
      с запятой, вложенный массив, NULL в массиве, цена без валюты, чужая папка документа,
      6 документов), `anon` читает новые колонки и город через связь с `cities`, но не пишет
      в справочник; поиск города идёт по индексу. Проверка нашла и закрыла две дыры:
      нестрогий jsonpath раскрывал вложенные массивы, а NULL у валюты пропускал CHECK цены.
- [x] **20.4. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Сделано 28.09.2026,
      копия `backups/2026-09-28_15-18-47`.
- [x] **20.5. 🤖 ИИ:** `npm run db:types`, справочники и zod-схемы в `entities/profile`,
      `PUBLIC_PROFILE_COLUMNS`, новые поля в `PATCH /api/profile`, роуты `GET /api/cities`
      (поиск города в стране), `POST /api/profile/documents` и
      `DELETE /api/profile/documents/[id]`, серверные функции сущности, удаление файлов
      документов в `DELETE /api/me`.

      Сделано 28.09.2026. Страны и города — новый слайс `entities/location` (`searchCities`,
      `cityQueries`, `getCountryName`). Схема профиля общая для формы и API. Связанные поля
      (`country`, `cityId`, `workFormats` и `priceAmount`, `priceCurrency`) `PATCH` принимает
      только группой, `getProfileChanges` так их и отправляет. Документы пишутся списком
      с проверкой `updated_at`: параллельная загрузка из двух вкладок не теряет запись. Чтение
      картинки из multipart вынесено в `readImageUpload` (`@/app/api/_lib`), фото использует его
      же. Проверено на dev-сервере: поиск городов (`tbi` и `Тбилиси` → Tbilisi, `zurich` →
      Zürich, 400 на неверную страну и пустой запрос), публичный профиль с новыми полями от
      гостя, 401 без сессии; схемы — 20 сценариев скриптом. Запись с сессией (PATCH и документы)
      проверим через форму в 20.8.
- [x] **20.6. 🤖 ИИ:** раздел с данными психолога в `profile-form` в настройках: страна, формат
      работы, город, с кем работает, подходы, языки, цена. Документы — отдельный блок настроек
      вне формы. Изображения документов перекодируются на клиенте через canvas, так пропадают
      EXIF с геолокацией; сервер проверяет формат и размеры, как у фото профиля.

      Сделано 28.09.2026. Раздел Practice в `profile-form` (`showPractice`, только настройки),
      списки с поиском — `Combobox` в `shared/ui` на shadcn `popover` и `command` (зависимость
      `cmdk`), галочки — `checkbox`. Документы — виджет `profile-documents`. По решению
      пользователя к документу сохраняется превью: полное изображение до 2048 px, превью до
      480 px (десятки КБ) — для страницы пользователя, полное — для просмотра. Проверено
      в Playwright на прод-сборке с подменёнными ответами API (город — из настоящего API),
      22 проверки: выбор страны и города (в том числе `Тбили`), лимит 5 подходов, языки, цена,
      тело PATCH, ошибка «In person без города», повторное сохранение отправляет группу полей,
      документ 4000×3000 (10 МБ) уходит как WebP 2048×1536 (1,5 МБ) и превью 480×360 (21 КБ)
      без EXIF, удаление, 320 px в тёмной теме без горизонтальной прокрутки. Нашли и исправили:
      подпись города пропадала после сохранения — форма пересоздаётся раньше, чем приходит
      обновлённый профиль.
- [x] **20.7. 🤖 ИИ:** `/privacy` и `/terms`: новые данные, документы публичны, пользователь
      отвечает за подлинность документов, источник справочника городов (GeoNames, CC BY 4.0);
      дата «Last updated». README и AGENTS.md: роуты, слайсы, таблицы, bucket, скрипт справочника.

      Сделано 28.09.2026, «Last updated» — September 28, 2026. `/privacy`: в публичном профиле
      (раздел 1.5) — данные практики и документы с подписями; документы публикуются сразу,
      номера и подписи лучше закрыть, браузер удаляет EXIF, хранятся изображение и превью,
      удаление стирает оба; справочник городов из GeoNames, выбор города ничего туда не
      отправляет; Supabase хранит и документы; удаление аккаунта удаляет документы. `/terms`:
      Freudin не оказывает психологических услуг, не сторона договорённостей между
      пользователями и не принимает оплату сессий; пользователь подтверждает, что сведения
      о квалификации верны, а документы выданы ему, настоящие и не изменены; документы не
      проверяются, жалоба — на почту поддержки; в отказе от гарантий — «данные пользователей
      не проверяем»; атрибуция GeoNames по CC BY 4.0 в разделе 6. README и AGENTS.md
      обновлены в 20.5–20.6, здесь добавлено, где стоит атрибуция. Черновики `docs/legal`
      не меняли: это дословные исходники владельца.
- [x] **20.8. 🧑‍💻 Разработчик:** проверка на проде: заполнить поля, загрузить и удалить документ.

      Сделано 28.09.2026: всё работает. Замечание — в списке языков были коды вместо названий
      (`aa`, `ab`): Chrome не знает названий 45 редких языков, их убрали из списка (20.1).

**Готово, когда:** психолог заполняет в настройках страну, формат работы (при офлайне — город из
справочника), с кем работает, подходы, языки и цену, загружает и удаляет документы, и всё это
сохраняется.

#### Шаг 21. Данные психолога на странице пользователя
- [x] **21.1. 🤖 ИИ:** `GET /api/profiles/[username]` отдаёт новые поля и документы, демо-профиль
      `demo` дополняется ими.

      Сделано 28.09.2026: роут отдаёт поля с 20.5, демо-профиль заполнен (Tbilisi, три подхода,
      три языка, $60, документ `public/demo-certificate.svg`).
- [x] **21.2. 🤖 ИИ:** `profile-card`: подходы, с кем работает, формат работы, страна и город,
      языки, цена, превью документов с просмотром в диалоге. Семантика: список `dl`, осмысленный
      `alt` у документов, на 320 px без горизонтальной прокрутки.

      Сделано 28.09.2026. После описания — `dl` (`PracticeDetails`): подходы списком `ul`,
      остальное фразой через `Intl.ListFormat` («Individuals and couples», «English, Russian,
      and Georgian»), место — «Tbilisi, Georgia» или только страна, цена через
      `formatPrice` — «From $60 per session», «From GEL 150 per session». После ссылок —
      раздел `h2` «Documents» (`DocumentGallery`): превью с подписью, `alt` превью — подпись
      документа (он же имя кнопки, видимая подпись скрыта от скринридера), по нажатию —
      полное изображение в диалоге. Незаполненные пункты не показываются, профиль без данных
      психолога выглядит как раньше. Проверено в Playwright на прод-сборке, 18 проверок:
      `/demo`, профиль со всеми полями и 5 документами разных пропорций на 320 px в тёмной
      теме (без горизонтальной прокрутки), диалог с клавиатуры и возврат фокуса, профиль без
      данных, без ошибок в консоли.
- [x] **21.3. 🧑‍💻 Разработчик:** проверка на проде: своя страница и чужая в гостевом режиме.
      Проверено пользователем 29.09.2026 на телефоне и на компьютере: всё работает.

**Готово, когда:** на `/<username>` видны подходы, с кем работает, формат работы, страна и город,
языки, цена и документы, а страница профиля без этих данных выглядит как раньше.

#### Шаг 28. Порядок блоков на странице пользователя

Запрос пользователя 28.09.2026: фото, имя и адрес всегда вверху, остальные блоки страницы
владелец расставляет сам в настройках — перетаскиванием или стрелками ↑↓.

- [x] **28.1. 🧑‍💻 Разработчик решает:** решения пользователя 28.09.2026:
      - сначала — отдельный список «Page layout» под полями формы. После проверки локально
        пользователь попросил двигать сами блоки формы: настройки — минималистичный
        конструктор, порядок блоков в них совпадает с порядком на странице; сохраняется
        кнопкой Save вместе с формой;
      - двигается каждый пункт отдельно, 9 блоков: Bio, Approaches, Works with, Format,
        Location (страна и город), Languages, Price, Links, Documents;
      - перетаскивание — новая зависимость `@dnd-kit/core` и `@dnd-kit/sortable`.
- [x] **28.2. 🤖 ИИ:** миграция `*_add_profile_section_order.sql`: колонка
      `profiles.section_order text[]` (пустой массив — порядок по умолчанию), CHECK формата
      и количества, `grant select` для `anon`. Справочник блоков, схема, чтение и запись
      в `entities/profile`, список в `profile-form`, вывод по порядку в `profile-card`.

      Сделано 28.09.2026. Справочник — `profileSectionIds` (порядок по умолчанию — как было
      на странице), названия — `profileSectionLabels` (шапки блоков в настройках и подписи
      `dt` на странице). Сохранённый порядок нормализует `normalizeSectionOrder`: неизвестные
      блоки и повторы отбрасываются, недостающие (в том числе новые блоки) добавляются в конец.
      Форма настроек — конструктор (`SortableBlocks`): после фото, имени и адреса блоки в рамках
      с шапкой (ручка, название, стрелки ↑↓), поля внутри; подпись поля, совпадающая
      с названием блока, видна только скринридеру. Блок документов — виджет
      `profile-documents` слотом `documentsBlock` (загрузка и удаление по-прежнему сохраняются
      сразу; `submit` диалога загрузки не всплывает через портал в форму профиля). Контактная
      почта — после блоков: на странице её нет. Онбординг не изменился: Bio и ссылки без рамок
      и стрелок. Перетаскивание — за ручку мышью и пальцем; с клавиатуры и в скринридере
      порядок меняют стрелки (ручка вне порядка табуляции), фокус остаётся на нажатой
      стрелке, а у крайнего блока уходит на соседнюю, перестановка объявляется через
      `aria-live`. На странице незаполненные блоки не показываются, идущие подряд пункты
      практики — один `dl`, даже если между ними пустой блок. Миграция проверена на боевой
      базе в транзакции с откатом: у существующих профилей пустой порядок, 6 неверных
      значений отклоняются, `anon` читает колонку. Конструктор проверен в Playwright
      на dev-сервере с подменёнными ответами API, 26 проверок: порядок блоков, стрелки мышью
      и с клавиатуры, фокус, перетаскивание, Enter в подписи документа не отправляет форму
      профиля, тело PATCH только с `sectionOrder`, порядок на странице, 320 px в тёмной теме,
      онбординг без рамок.
- [x] **28.3. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Миграцию
      применить до выкладки кода: код читает `section_order`, без колонки страницы профилей
      отвечают ошибкой.
- [x] **28.4. 🤖 ИИ:** `npm run db:types`, `npm run typecheck` и `npm run build`: до миграции
      в типах БД нет `section_order`, и проверка типов не проходит. Сделано 28.09.2026.
- [x] **28.5. 🧑‍💻 Разработчик:** проверка на проде: переставить блоки стрелками
      и перетаскиванием (в том числе на телефоне), сохранить, открыть свою страницу.
      Сделано 28.09.2026: всё работает.

**Готово, когда:** владелец переставляет блоки формы в настройках, а `/<username>` показывает блоки
в том же порядке; у профилей без заданного порядка страница выглядит как раньше.

#### Шаг 29. Данные психолога, часть 2
Из описания продукта (`docs/PRODUCT.md`, опоры 3.1 и 3.5) и решений пользователя 29.09.2026.
Бывший шаг 30 (образование и контакты) объединён с этим: у них общая миграция.

- [x] **29.1. 🧑‍💻 Разработчик решает:** решения 29.09.2026:
      - на странице: стаж по дате начала практики, образование (до 5 записей: квалификация, вуз,
        год), контакты для связи (почта, телефон, WhatsApp, Telegram) и предпочтительный способ
        связи — главная кнопка под именем. Способ выбирается из заполненных контактов и ссылок
        на соцсети;
      - не показываются, нужны для поиска: дата рождения (психологу не меньше 18 лет), пол
        (Female, Male, Other) и запросы клиентов. Пол не показываем по умолчанию ИИ: вопрос
        о нём не задавался;
      - запросы — списки пользователя: состояния, отношения, работа и учёба, события в жизни;
        запросы пар — при «Works with: Couples»; детские (шесть групп) — при Children или Teens.
        Для этого в «Works with» добавлен пункт Children.
- [x] **29.2. 🤖 ИИ:** миграция `*_add_psychologist_details.sql`: колонки `profiles.education`,
      `contacts`, `preferred_contact`, `practice_started_on` (доступны `anon`) и таблица
      `profile_private` (дата рождения, пол, запросы; RLS — только владелец). Проверена на боевой
      базе в транзакции с откатом: 29 проверок ограничений, `anon` не читает `profile_private`,
      чужой пользователь не видит и не пишет строку владельца. Код: справочники и схемы
      в `entities/profile` (связанные группы: ссылки, контакты и способ связи; «Works with»
      и запросы), `getPrivateDetails` и `/api/me`, форма настроек (блоки Experience, Education,
      Contacts и раздел Search details), страница (кнопка связи, стаж, образование, контакты),
      демо-профиль, `/privacy` (разделы 1.5, 1.6, 3, 9) и `/terms` (разделы 1 и 4), дата
      «Last updated» — September 29, 2026. Сделано 29.09.2026. Проверено в Playwright
      на dev-сервере с подменёнными ответами API, 31 проверка: группы запросов появляются
      и пропадают вместе с Couples и Teens, ошибки телефона, года и возраста младше 18, варианты
      способа связи, тела PATCH (группы полей, порядок запросов, нормализация телефона
      и Telegram), сброс удалённой ссылки-способа связи и парных запросов, кнопка связи, стаж,
      образование и контакты на странице, закрытых данных на странице нет, 320 px в тёмной теме,
      `/demo`. Нашли и исправили: скрытый `<select>` Radix после пересоздания формы присылал
      пустое значение и сбрасывал способ связи.
- [x] **29.3. 🧑‍💻 Разработчик:** `npm run db:dump`, затем `npm run db:push`. Миграцию применить до
      выкладки кода: код читает новые колонки, без них страницы профилей отвечают ошибкой.
      Сделано 29.09.2026.
- [x] **29.4. 🤖 ИИ:** `npm run db:types`, `npm run typecheck` и `npm run build` (до миграции типы
      БД не знают новых колонок), проверка формы и страницы в браузере. Сделано 29.09.2026:
      типы, проверка типов и сборка проходят. Прод-сборка локально на боевой базе: гость получает
      публичный профиль с новыми полями (200), закрытых полей в ответе нет, `/api/me` без
      сессии — 401. Форма и страница проверены в браузере в 29.2.
- [x] **29.5. 🧑‍💻 Разработчик:** проверка на проде: заполнить новые поля в настройках, открыть
      свою страницу и её же в гостевом режиме. Проверено пользователем 29.09.2026.
- [x] **29.6. 🤖 ИИ:** показать в Storybook новые элементы (правило AGENTS.md): главную кнопку
      связи, блоки стажа, образования и контактов на странице, раздел Search details. Сделано
      29.09.2026: истории `Widgets/Profile card` (Full, Owner, Minimal, PreferredContact — подписи
      кнопки для каждого способа связи) и `Widgets/Profile form` (Settings, SettingsEmpty).
      Проверено в браузере: все шесть историй в обеих темах, нужные тексты на месте, без
      горизонтальной прокрутки на 390 px. `npm run build-storybook` проходит.

**Готово, когда:** психолог заполняет новые поля в настройках, страница показывает стаж,
образование, контакты и кнопку связи, а дата рождения, пол и запросы видны только ему.

#### Шаг 30. Образование и контакты для связи
Объединён с шагом 29 (29.09.2026).

#### Шаг 36. QR-код страницы
Запрос пользователя 29.09.2026 (раньше был в списке этапа G).

- [x] **36.1. 🤖 ИИ:** кнопка Share открывает диалог: QR-код страницы, Download QR code (PNG,
      `freudin-<username>-qr.png`), Copy link и Share via… (системное меню, только где есть
      `navigator.share`). Код ведёт на прод-адрес `https://www.freud.in/<username>`, а не на
      текущий origin: его печатают на визитках. Чёрный на белом в обеих темах, уровень коррекции
      M, рисуется в браузере библиотекой `qrcode.react` (внешних сервисов нет, `/privacy` не
      меняется). История `Widgets/Profile card` → ShareDialog. Сделано 29.09.2026. Проверено
      в браузере в обеих темах: код распознаётся (`BarcodeDetector`) как ссылка на страницу,
      скачивание, копирование, системное меню получает ссылку и имя, фокус после закрытия
      возвращается на Share, без горизонтальной прокрутки на 390 px.
      Правка по замечанию пользователя: кнопки не влезали в окно. Окно на 25% шире стандартного
      (`sm:max-w-120`, 480 px), кнопки переносятся на следующий ряд и растягиваются на всю
      ширину окна (`sm:*:grow`): ряд симметричен. Проверено на 390, 640
      и 1280 px с двумя и тремя кнопками и с крупным шрифтом.
- [x] **36.2. 🧑‍💻 Разработчик:** проверка на проде: открыть Share на своей странице, отсканировать
      код телефоном, скачать PNG. Проверено пользователем 29.09.2026.

#### Шаг 37. Собственные заголовки ссылок и подписи действий
Решение пользователя 01.10.2026; референсы — Linktree и Taplink, раздел 9 `PRODUCT.md`.

- [x] **37.1. 🤖 ИИ:** необязательный собственный заголовок ссылки в общей модели, zod-схеме,
      API, онбординге и настройках. Без заголовка сохраняется нынешняя подпись из платформы
      и URL; существующие ссылки продолжают работать. Лимит и проверка заголовка одинаковые
      на клиенте и сервере.

      Сделано 01.10.2026: поле `title` в `socialLinkSchema` (до 40 символов, пробелы по краям
      срезаются, по умолчанию `""`), поле Title (optional) под адресом ссылки. Миграция не нужна:
      ссылки — jsonb, CHECK проверяет только их число, а старые записи без `title` схема читает
      с пустым заголовком.
- [x] **37.2. 🤖 ИИ:** показывать заголовок на странице и в выборе главного действия.
      Подпись главной кнопки соответствует действию: ссылка на канал или сайт не называется
      «Message on …». Новые состояния — в Storybook; README и AGENTS.md — по итогам реализации.

      Сделано 01.10.2026: заголовок — в `getSocialLinkCaption` (кнопка ссылки, выбор главной
      кнопки, сводка свёрнутого блока). Главная кнопка-ссылка: заголовок, без него
      `Open Instagram` или `Visit website`; длинная подпись обрезается многоточием. Демо-профиль:
      ссылка About Freudin. Истории `Widgets/Profile card` (Full, PreferredContact) и
      `Widgets/Profile form`. Проверено в Playwright на прод-сборке с подменёнными ответами API:
      старая ссылка без заголовка не даёт изменений (Save неактивна), заголовок в превью, на
      кнопке и в выборе главной кнопки, в `PATCH` без пробелов, очистка — `""`, maxLength 40,
      320 px без горизонтальной прокрутки, старый черновик онбординга без `title`, `/demo`
      и `/ivan-v` в серверном HTML.
- [x] **37.3. 🧑‍💻 Разработчик:** проверить старые ссылки, собственные подписи и главную кнопку
      на телефоне и компьютере. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** психолог задаёт понятные названия ссылок, а кнопки описывают фактическое действие.

#### Шаг 38. Сворачивание блоков настроек с сохранением состояния
Решение пользователя 01.10.2026: конкретный блок опций можно свернуть, его состояние сохраняется.

- [x] **38.1. 🤖 ИИ:** сворачивание блоков опций в настройках: публичные блоки профиля,
      закрытые данные для поиска и разделы аккаунта. Заголовок остаётся видимым; управление
      доступно с клавиатуры, состояние понятно скринридеру. Перестановка публичных блоков
      сохраняет работу перетаскивания и стрелок.

      Сделано 01.10.2026: заголовок блока — кнопка `DisclosureButton` (`shared/ui`, новый
      компонент с историей) с `aria-expanded` и `aria-controls`; сворачиваются 12 блоков
      конструктора, Search details и раздел Account. Свёрнутое прячется атрибутом `hidden` и остаётся
      в DOM: Collapsible из Radix не подошёл, он размонтирует содержимое, и поля теряли бы
      состояние. Стрелки ↑↓ и перетаскивание работают и у свёрнутых блоков.
- [x] **38.2. 🤖 ИИ:** сохранять только состояние раскрытия в localStorage, отдельно для
      пользователя, по стабильному ID блока. Восстанавливать после перезагрузки и возвращения
      в настройки, независимо от порядка блоков. По умолчанию блоки раскрыты; сворачивание
      не меняет значения полей и видимость блоков публичной страницы. При ошибке сохранения
      раскрывать блок с ошибочным полем. Обновить `/privacy`, `/terms` и Last updated при
      внедрении нового хранения в браузере (правило 11 `docs/workflows/process.md`).

      Сделано 01.10.2026: Zustand-стор `useCollapsedBlocksStore` (`views/settings/model`, ключ
      `freudin:settings-collapsed-blocks`) хранит только id блоков по id пользователя. Ошибка
      при сохранении разворачивает блок с неверным полем (`fieldBlocks` в `profile-form`: тип
      требует блок для каждого поля схемы) и ставит фокус на первое неверное поле. `/privacy`,
      раздел 2, — оба новых ключа localStorage, «Last updated» — October 1, 2026. `/terms` не
      менялся: раздел 7 уже говорит о технологиях, которые «store settings you choose».
- [x] **38.3. 🤖 ИИ:** состояния в Storybook, README и AGENTS.md.

      Сделано 01.10.2026: истории `Freudin/Disclosure Button` и `Widgets/Profile form` →
      SettingsCollapsed; README и AGENTS.md.
- [x] **38.4. 🧑‍💻 Разработчик:** проверить сохранение состояния, перестановку, ошибки скрытых
      полей, клавиатуру и смену аккаунта в одном браузере. Принято пользователем 04.10.2026.

**Готово, когда:** каждый блок восстанавливает своё состояние, а поля и порядок страницы не теряются.

#### Шаг 39. Удобная работа с длинной формой настроек
Решение пользователя 01.10.2026; сворачивание блоков — шаг 38, превью — шаг 40.

- [x] **39.1. 🤖 ИИ:** доступная при прокрутке панель Save; после шага 40 подключить Preview.
      Учесть мобильную клавиатуру и фокус. Сохранить индикатор Saving…,
      защиту от повторной отправки и
      предупреждение об уходе с несохранёнными правками. Панель не перекрывает поля.

      Сделано 01.10.2026: липкая панель внизу формы (Save, Preview на телефоне, статус Unsaved
      changes), кнопка Save — вне `<form>` через атрибут `form`. `scroll-padding-bottom` в
      `globals.css`: поле в фокусе не прячется под панелью. На телефоне панель стоит внизу
      страницы и при открытой клавиатуре уходит под неё, поля не перекрывает. Saving…, защита от
      повторной отправки и предупреждение об уходе остались прежними.
- [x] **39.2. 🤖 ИИ:** ясно отделить публичную страницу, закрытые Search details и настройки
      аккаунта. У свёрнутых блоков показывать краткую сводку заполненного без приватных данных
      в превью. У документов явно объяснить: загрузка и удаление действуют сразу, отдельно
      от Save формы. Без отдельного нового конструктора и роутов для каждого раздела.

      Сделано 01.10.2026: раздел Profile стал Your page с подписью «Everyone can see it at
      www.freud.in/<username>, except Search details.»; у свёрнутых блоков — сводка
      (`getBlockSummary`: подходы, город, цена и т. п.), у Search details — только «2 of 3
      filled», без значений; у документов — «Uploads and deletions are saved right away», как
      и было.
- [x] **39.3. 🤖 ИИ:** показать панель и состояния в Storybook, обновить документацию.

      Сделано 01.10.2026: панель видна в историях `Widgets/Profile form`; README и AGENTS.md.
- [x] **39.4. 🧑‍💻 Разработчик:** проверить длинный профиль, телефон, клавиатуру, ошибки полей
      и публикацию документов отдельно от сохранения формы. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** сохранить правки можно при работе с любым блоком длинной формы;
после шага 40 из той же панели доступно превью.

#### Шаг 40. Превью страницы в редакторе
Решение пользователя 01.10.2026; перенос конкретной задачи из общего списка этапа G.

- [x] **40.1. 🤖 ИИ:** превью в онбординге и настройках на существующей `ProfileCard`:
      на компьютере рядом с формой, на телефоне переключение Edit / Preview с сохранением
      ввода. Показывать текущие несохранённые публичные поля, фото и порядок блоков; закрытые
      данные для поиска и контактная почта аккаунта в превью не попадают.

      Сделано 01.10.2026: `renderPreview` в `profile-form`, превью собирает
      `toPreviewProfile` (`entities/profile`): каждое поле проверяется отдельно, неверное в превью
      не попадает, закрытых данных и контактной почты нет. От `lg` превью — колонка справа (липкая,
      с прокруткой), на телефоне — кнопка Preview / Edit в панели, форма при этом скрыта, но не
      размонтирована. Фото — выбранное в форме, порядок блоков — из формы.
- [x] **40.2. 🤖 ИИ:** превью не сохраняет и не публикует правки; публикация полей — через
      Create page / Save. Документы отражают уже опубликованные загрузки из отдельного
      сценария. Последующие FAQ, карточки услуг и хайлайт используют тот же рендер страницы.
      Storybook, README и AGENTS.md.

      Сделано 01.10.2026: `ProfileCard` с `isPreview` (без Share, Edit и подсказок, имя
      и заголовок документов — не заголовки страницы); в настройках документы — уже
      опубликованные. Истории `Widgets/Profile form` → WithPreview и `Widgets/Profile card` →
      Preview; README и AGENTS.md.

      Шаги 38–40 проверены в Playwright на прод-сборке с подменёнными ответами API,
      36 проверок: превью рядом с формой и обновление при вводе, в превью нет даты рождения,
      панель Save видна в первом экране длинной формы, `PATCH` только с изменённым полем,
      сворачивание Bio, Search details и Account, сводки, перестановка свёрнутого блока,
      восстановление после перезагрузки, в localStorage только id блоков, у другого пользователя
      в том же браузере блоки развёрнуты, неверный телефон в свёрнутом Contacts — блок
      развернулся и поле в фокусе, `/settings#block-work-formats` разворачивает блок, ставит
      фокус и убирает хеш; 390 и 320 px: Preview / Edit без потери ввода, без горизонтальной
      прокрутки; превью на онбординге без сворачивания; ошибок в консоли нет.
- [x] **40.3. 🧑‍💻 Разработчик:** проверить изменение полей, фото и порядка, переход между
      режимами на телефоне, отмену правок и отсутствие закрытых данных. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** владелец видит будущую страницу до сохранения, а переключение режимов не теряет ввод.

#### Шаг 41. Помощь с завершением страницы после создания
Решение пользователя 01.10.2026: короткий онбординг сохраняется, дальше помогаем дополнить визитку.

- [x] **41.1. 🤖 ИИ:** после создания страницы показывать только владельцу список следующих
      действий: добавить контакт, выбрать главную кнопку, указать формат и цену, скопировать
      ссылку. Пункты заполнения определяются по текущему профилю, ведут к нужным настройкам;
      копирование использует существующее действие Share.

      Сделано 01.10.2026: `OwnerChecklist` в `profile-card` (только `isOwner`): Add a photo, Add a
      way to contact you, Choose your main contact button, Add your work format and price —
      по текущему профилю, ссылки `routes.settingsBlock(id)` разворачивают нужный блок настроек;
      внизу — существующий Share.
- [x] **41.2. 🤖 ИИ:** помощь необязательна, её можно закрыть; незаполненные дополнительные
      поля не блокируют создание и публикацию. Проверить сценарий частичного успеха: профиль
      создан, фото не загрузилось. Новые состояния в Storybook, обновление документации.

      Сделано 01.10.2026: подсказки скрываются крестиком (Zustand-стор `useChecklistStore`,
      localStorage `freudin:page-checklist`, по username) и пропадают сами, когда всё заполнено.
      Частичный успех онбординга (страница создана, фото не загрузилось): в подсказках остаётся
      пункт Add a photo. История `Widgets/Profile card` → OwnerChecklist; проверена в ките,
      на личной странице (она читает боевую базу) — только в 41.3.
- [x] **41.3. 🧑‍💻 Разработчик:** пройти создание минимальной страницы и заполнение оставшихся
      полей; проверить, что посетитель не видит подсказки владельца. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** после создания психолог понимает, как дополнить страницу и начать делиться ею.

#### Шаг 42. FAQ на странице психолога
Решение пользователя 01.10.2026. Это ответы владельца о своей практике; FAQ о Freudin — шаг 35.

- [x] **42.1. 🤖 ИИ:** список вопросов и ответов в публичном профиле: добавление, изменение,
      удаление и порядок. Общие лимиты и zod-валидация формы/API, сохранение в БД с доступом
      владельца на запись и гостя на чтение; при миграции — существующий процесс бэкапа и типов.

      Сделано 02.10.2026: колонка `profiles.faq` (миграция `*_add_page_content.sql`: до 10 записей,
      вопрос 1–150 символов, ответ 1–1000 — CHECK-функция `is_valid_profile_faq`, длины не через
      `like_regex`: там повтор ограничен 255), схема `faqSchema`, блок FAQ в конструкторе
      настроек: добавление, правка, удаление, перестановка ↑↓, пустой ответ — ошибка у поля.
- [x] **42.2. 🤖 ИИ:** раскрывающиеся ответы на странице и в превью, незаполненный блок скрыт,
      FAQ участвует в порядке блоков. Предложить примеры про первую встречу, онлайн-формат,
      длительность и отмену; ответы пишет психолог. Семантика, клавиатура и текст в серверном
      HTML; Storybook и документация, юридические тексты при добавлении новых данных.

      Сделано 02.10.2026: `FaqList` в `profile-card` — `details`/`summary` (клавиатура без JS,
      текст в серверном HTML), блок `faq` в порядке блоков, пустой скрыт. Примеры вопросов
      кнопками: первая встреча, онлайн, длительность, отмена — добавляются без ответа.
      `/privacy` 1.5 — FAQ и карточки услуг, Last updated — October 2, 2026. Истории
      `Widgets/Profile card` (Full) и `Widgets/Profile form` (Settings).
      Проверено 02.10.2026 в Playwright на прод-сборке с подменёнными ответами API (живые профили
      до миграции не открываются) и на `/demo`.
      03.10.2026 по решению пользователя `details` заменён на `Accordion` из shadcn
      (`type="multiple"`). Закрытых ответов теперь нет в серверном HTML, для SEO это
      непринципиально.
- [x] **42.3. 🧑‍💻 Разработчик:** проверить создание и редактирование ответов, порядок,
      раскрытие с клавиатуры, сохранение и гостевой просмотр. Принято пользователем 04.10.2026.

**Готово, когда:** психолог публикует свои ответы, а посетитель читает их без регистрации.

#### Шаг 43. Карточки услуг и цены для разных категорий Works with
Решение пользователя 01.10.2026: возможность доступна, если выбрано две или больше категорий
клиентов в Works with. Категории берём из существующего справочника `clientTypes`.

- [x] **43.1. 🤖 ИИ и 🧑‍💻 Разработчик:** уточнить формат карточки и лимиты: категория из
      выбранных Works with, название/описание услуги, длительность, цена и валюта, прямой
      контакт. Определить правило общей цены «от» для страницы и будущего каталога; суммы
      в разных валютах не сравнивать как числа. Решения, принятые 🤖 в 43.2, пользователь подтвердил 09.10.2026.
- [x] **43.2. 🤖 ИИ:** модель, БД, общая схема формы/API и редактор карточек при нескольких
      категориях. Для одной категории остаётся нынешняя цена сессии. При изменении Works with
      показать, какие карточки требуют обновления; сохранённые услуги и цены не удалять молча.

      Сделано 02.10.2026. Решения 43.1 принял ИИ (пользователь пропустил шаг, подтвердить
      в 43.4): карточка — категория из выбранных Works with, название до 80, описание до 500,
      длительность 1–600 минут, цена с валютой (по умолчанию — валюта цены сессии), до 10
      карточек; общей цены «от» не вычисляем — остаётся цена сессии, суммы в разных валютах
      не сравниваем. Колонка `profiles.services` (CHECK `is_valid_profile_services` сверяет
      категорию с `client_types`), группа `clientTypes`, `concerns`, `services` в PATCH.
      Добавить карточку можно при двух и больше категориях; снятая категория — ошибка у
      карточки «… isn’t selected in Works with», сохранить нельзя, карточка не удаляется.
- [x] **43.3. 🤖 ИИ:** карточки на странице и в превью, порядок блоков и кнопки прямой связи.
      При отсутствии карточек сохранить нынешнее представление цены. Семантика и серверный
      HTML, Storybook, README, AGENTS.md и юридические тексты по новым данным. Freudin
      не принимает оплату и не записывает на сессии.

      Сделано 02.10.2026: `ServiceList` (раздел Services, `h3` у карточек, в превью — без
      заголовков): категория · длительность · цена, описание, кнопка связи — действие главной
      кнопки. Без карточек цена сессии показывается как раньше. Демо-профиль и истории.
      10.10.2026 по просьбе пользователя кнопка связи из карточек убрана: она повторяла
      главную кнопку страницы.
- [x] **43.4. 🧑‍💻 Разработчик:** проверить одну и несколько категорий, разные цены,
      изменение Works with, старые профили и переход к контакту из карточки. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** психолог с несколькими категориями клиентов показывает соответствующие услуги
и цены, а для одной категории сохраняется простой сценарий.

#### Шаг 44. Хайлайт кнопок и блоков страницы
Решение пользователя 01.10.2026: владелец может визуально выделить кнопки и целые блоки.

- [x] **44.1. 🤖 ИИ:** опция Highlight для контентных кнопок (ссылки, контакты, карточки услуг)
      и блоков публичной страницы. Выбор сохраняется в профиле и проходит общую валидацию
      формы/API; у существующих профилей выделение по умолчанию выключено.

      Сделано 02.10.2026: `highlightedSections` (колонка `highlighted_sections`) — галочка
      Highlight this block у каждого блока конструктора; ссылки и карточки услуг — поле
      `highlighted` в их jsonb (Highlight link N, Highlight service N), у старых — `false`.
      Контакты на странице — ссылки в тексте, а не кнопки: их выделяют блоком Contacts.
- [x] **44.2. 🤖 ИИ:** единый вариант выделения через токены темы, на странице и в превью,
      с проверкой контраста и фокуса в обеих темах. Порядок и назначение кнопок сохраняются.
      Storybook и документация; загрузка медиа не является условием включения хайлайта.

      Сделано 02.10.2026: блок — фон `accent` со скруглением, выделенный пункт практики выходит
      из общего `dl`; ссылка — `variant="secondary"`; карточка — фон `accent`. Контраст текста
      в выделении: светлая тема от 4.7:1, тёмная от 5.4:1. История `Widgets/Profile card` →
      Highlighted, демо-профиль: выделены Bio, ссылка About Freudin и карточка Couples session.
- [x] **44.3. 🧑‍💻 Разработчик:** проверить отдельную кнопку и блок, сохранение выбора,
      телефон, клавиатуру и светлую/тёмную темы. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** психолог выбирает, что выделить, и посетитель видит это выделение на странице.

#### Шаг 45. Три варианта обложки: опция профиля
Решение пользователя 01.10.2026: пока добавляем выбор, внешний вид страницы можно не менять.

- [x] **45.1. 🤖 ИИ:** параметр профиля с тремя вариантами Classic / Banner / Hero
      (`classic`, `banner`, `hero`), значение по умолчанию — `classic` для старых и новых
      профилей. Добавить в БД, типы, общую zod-схему, API и выбор в настройках; сохранять
      вместе с правками профиля.

      Сделано 02.10.2026: колонка `cover` (`classic` по умолчанию, CHECK на три значения),
      `coverIds`, поле Page cover в настройках с подсказкой «Cover styles are coming soon…»
      (это и часть 45.2), сохраняется вместе с правками, вид страницы не меняется.

      **До коммита (шаги 42–45):** 🧑‍💻 `npm run db:dump`, затем `npm run db:push` — миграция
      `20261001204843_add_page_content.sql`; после неё 🤖 или 🧑‍💻 `npm run db:types`. Без
      миграции код читает несуществующие колонки, и личные страницы и `/api/me` отвечают
      ошибкой. До этого `database.types.ts` дополнен вручную ровно тем, что даст генерация.
      Миграция проверена на боевой базе в транзакции с откатом: 25 проверок (длины, лимиты,
      форматы, категория карточки из `client_types`, `anon` читает новые колонки).
- [x] **45.2. 🤖 ИИ:** в интерфейсе объяснить, что оформление вариантов появится позже:
      на этом шаге страница и превью сохраняют нынешний вид при любом выборе. Новые
      изображения и визуальные макеты обложек не требуются. Выбор в Storybook, README и AGENTS.md;
      реализацию трёх оформлений вести отдельным шагом после согласования макетов.

      Снят 03.10.2026: вид обложек рисует шаг 50, выбор карточками в редакторе — шаг 51.
- [x] **45.3. 🧑‍💻 Разработчик:** проверить сохранение каждого значения, восстановление
      после перезагрузки и значение по умолчанию существующего профиля. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** в профиле сохраняется один из трёх вариантов, а внешний вид пока остаётся прежним.

#### Шаг 47. Разделы настроек в сайдбаре
Решение пользователя 02.10.2026: на странице настроек слишком много данных. Делим её на три
раздела с навигацией в левом сайдбаре, Save остаётся общей липкой панелью внизу.

- [x] **47.1. 🤖 ИИ:** разделы Account (username, контактная почта, способы входа, Sign out,
      Delete account), Public profile (всё, что видно на странице, и превью) и Search details
      (дата рождения, пол, запросы клиентов).

      Сделано 02.10.2026: раздел — в адресе `/settings?section=account|profile|search`
      (`routes.settingsSection`), по умолчанию Public profile. Форма одна: скрытые разделы
      прячутся атрибутом `hidden` и остаются смонтированными, поэтому правки не теряются при
      переключении, а Save и Unsaved changes общие (изменено в 47.5). Возврат после привязки
      способа входа ведёт в Account.
      Ширина — как у сайта (64rem, по замечанию пользователя: контент совпадает с шапкой), форма
      уже, чтобы рядом поместилось превью: около 19rem, как на телефоне. Превью встаёт рядом,
      когда ширины формы хватает (container query, с сайдбаром — от 1024 px), иначе
      открывается кнопкой Preview. В узкой форме строка ссылки перестраивается: платформа и ×
      сверху, адрес и заголовок под ними во всю ширину. На телефоне сайдбар — ряд из трёх кнопок.
      Сворачивание раздела Account и блока Search details убрано: теперь это разделы.
      Предупреждение об уходе не срабатывает на ссылках той же страницы с другим query.
      Проверено в Chromium с подменой `/api/me`: 390, 1000, 1024, 1280 и 1440 px, обе темы,
      без горизонтальной прокрутки, поля формы не выходят за её край.
- [x] **47.2. 🤖 ИИ:** истории `Widgets/Profile form` (AccountSection, SearchDetailsSection),
      README и AGENTS.md.
- [x] **47.3. 🤖 ИИ:** показать в Storybook сайдбар разделов настроек. Сделано 02.10.2026:
      сайдбар вынесен в `shared/ui/section-nav.tsx`, история `Freudin/Section Nav`.
- [x] **47.5. 🤖 ИИ:** Save по разделам (замечание пользователя 02.10.2026): в Account кнопка
      стоит под полями username и почты, а не в липкой панели, — остальные действия раздела
      срабатывают сразу. Несохранённые правки живут только в своём разделе: переход в другой
      спрашивает «You have unsaved changes. Discard them?» и сбрасывает их (страница пересоздаёт
      форму). Раньше правки переносились между разделами, а Save сохранял все.

      Сделано 02.10.2026. Проверено в Chromium: без правок раздел меняется без вопроса,
      «Отмена» оставляет раздел и правки, согласие сбрасывает их; Save в Account под полем
      отправляет только `username`.
- [x] **47.4. 🧑‍💻 Разработчик:** проверить переключение разделов с несохранёнными правками
      (подтверждение и сброс), Save в Account, привязку способа входа, телефон и ширины 1024
      и 1440 px. Проверено пользователем 09.10.2026 на телефоне, замечаний нет.

**Готово, когда:** каждый раздел открывается из сайдбара и по ссылке, а несохранённые правки
не переходят в другой раздел.

#### Шаг 48. Настройки — редактор на весь экран
Решение пользователя 02.10.2026 по референсу редактора Linktree: у `/settings` нет шапки и подвала
сайта, сайдбар прижат к левому краю и растянут на всю высоту, сверху — логотип, контент — на всю
ширину экрана, превью страницы видно всегда и занимает всё место, кроме колонки формы, ширина
формы — прежняя.

- [x] **48.1. 🤖 ИИ:** раскладка. Сделано 02.10.2026: шапка и подвал не рисуются на
      `/settings` (сами проверяют путь), сайдбар — логотип, переключатель темы и разделы
      (`SectionNav`), на экранах уже 1024 px он становится панелью сверху. `ProfileForm`
      получил раскладку `workspace`: колонка формы 22rem (поля — 19rem, как раньше), рамка
      превью на всю остальную ширину и высоту экрана (по замечанию пользователя: превью
      ведёт себя как личная страница — карточка внутри держит свою ширину), рамка прилипает
      к верху и прокручивается отдельно, вокруг — фон `muted`. Превью видно во всех разделах; на телефоне — по кнопке Preview (в Account
      её нет). Заголовок `h1` — название раздела. История `Widgets/Profile form` → Workspace,
      README и AGENTS.md. Проверено в Chromium: 390, 800, 1024 и 1440 px, обе темы, без
      горизонтальной прокрутки.
- [x] **48.2. 🧑‍💻 Разработчик:** проверить раскладку на своём экране и телефоне. Проверено
      пользователем 02.10.2026.

**Готово, когда:** настройки выглядят как редактор: сайдбар, форма и превью на весь экран.

<a id="step-49"></a>

#### Шаг 49. Скрытая личная страница
Запрос пользователя 02.10.2026: в Account — «Скрыть личную страницу». Режимы: видит только автор
(остальным — сообщение, что страница скрыта автором) или видят те, у кого есть пароль (4–8
символов без других требований). Решения пользователя: мягкий замок без защиты от перебора,
хранится только хэш пароля (03.10.2026 заменено: пароль хранится открытым текстом и виден
владельцу, 49.9), введённый пароль действует 30 дней.

- [x] **49.1. 🤖 ИИ:** миграция `20261002203730_add_page_visibility.sql`: колонка
      `profiles.visibility`, RLS — скрытые страницы читает только владелец; таблица
      `profile_page_access` (хэш bcrypt и токен доступа, хэш не читает никто); функции
      `set_profile_visibility`, `get_profile_visibility`, `unlock_profile_page`,
      `get_unlocked_profile`. Новый пароль или смена режима выдают новый токен — введённые
      раньше пароли перестают действовать. Проверено на боевой базе в транзакции с откатом:
      гость не видит скрытый профиль, неверный пароль не подходит, верный даёт токен, по
      токену профиль читается, после смены режима старый токен не действует, хэш не читается,
      короткий пароль и режим password без пароля отклоняются, гость не меняет режим.
      `database.types.ts` дополнен вручную ровно тем, что даст генерация.
- [x] **49.2. 🤖 ИИ:** код. Settings → Account: галочка Hide my page, варианты Only me
      и Anyone with the password, поле пароля (с заданным паролем — New password, пустое
      оставляет прежний), сохраняется кнопкой Save раздела. `/<username>`: гостю — «Hidden
      page» или «Protected page» с формой пароля, без имени и фото, `noindex`; после верного
      пароля — cookie `freudin-page-access-<username>` (httpOnly, 30 дней) и обычная страница;
      владельцу — его страница с пометкой и ссылкой в настройки. `POST
      /api/profiles/[username]/access`, `GET /api/profiles/[username]` учитывает cookie, проверка
      адреса видит скрытые профили. `/privacy` (разделы 1.5 и 2, Last updated — October 3,
      2026), README, AGENTS.md, история `Components/Radio Group`. Интерфейс настроек проверен
      в Chromium с подменой API.
- [x] **49.3. 🧑‍💻 Разработчик:** резервная копия (`npm run db:dump`), затем `npm run db:push`
      и `npm run db:types`. Сделано пользователем 03.10.2026. `db:types` упала с `Unauthorized`:
      `SUPABASE_ACCESS_TOKEN` в `.env` больше не действует (Management API отвечает 401), а файл
      типов остался пустым. 🤖 сгенерировал типы напрямую из базы (`supabase gen types
      --db-url` через пулер) и вернул блок `__InternalSupabase` из прежней версии.
- [x] **49.8. 🧑‍💻 Разработчик:** выпустить новый токен Supabase (Account → Access Tokens),
      заменить `SUPABASE_ACCESS_TOKEN` в `.env` и повторить `npm run db:types`: файл типов
      должен совпасть с текущим. Сделано пользователем 03.10.2026.
- [x] **49.4. 🤖 ИИ:** после миграции проверить страницу гостя вживую: скрытая, с паролем
      (неверный и верный пароль, cookie), вид владельца. 03.10.2026 проверено то, что не
      требует скрытого профиля: открытые страницы — 200, несуществующая — 404, занятый адрес —
      `available: false`, пароль для открытой страницы — 400. Скрытых профилей в базе нет:
      ждём 49.5 или разрешения временно скрыть профиль для проверки. Закрыт 09.10.2026 проверкой
      пользователя (49.5): скрытая страница недоступна, открывается паролем, после перезагрузки
      пароль не спрашивает. Найдено и исправлено: после неверного пароля кнопка оставалась
      неактивной со статусом Opening… — форма считала отправку успешной, раз `onSubmit` поймал
      ошибку; теперь ожидание после ответа держит только успех мутации.
- [x] **49.5. 🧑‍💻 Разработчик:** проверить на своём профиле: скрыть, открыть в другом браузере,
      ввести пароль, сменить пароль (старый доступ пропадает), вернуть страницу в открытые. Проверено пользователем 09.10.2026 на телефоне, замечаний нет. По его просьбе убрана пометка «Your page is protected with a password…» над страницей с паролем у владельца; у страницы «только владелец» пометка осталась.
- [x] **49.6. 🤖 ИИ:** показать в Storybook страницу «Hidden page» и «Protected page» с формой
      пароля. Сделано 03.10.2026: то, что видит гость, вынесено в `HiddenPageNotice`, история
      `Views/Hidden page` (Hidden, Protected) рядом с ним; проверено в собранном ките.
- [x] **49.9. 🤖 ИИ:** пароль виден владельцу (решение пользователя 03.10.2026, вместо «только
      хэш»): поле Password в Account заполнено сохранённым паролем, кнопка с глазом показывает
      и прячет его, под полем — «Don’t reuse a password from other accounts». Миграция
      `20261003090918_store_page_password.sql`: колонка `password` (4–8 символов) вместо
      `password_hash`, владелец читает свой пароль, функции сравнивают пароль напрямую; тот же
      пароль при Save не меняет токен доступа (гости не теряют доступ), новый — меняет.
      Хэши не восстановить: страницы с паролем миграция переводит в «только владелец». Проверено
      на боевой базе в транзакции с откатом: владелец читает пароль, гость и другой
      пользователь — нет, токен меняется только с паролем, старый пароль после смены не
      подходит. `/privacy` 1.5: пароль хранится как введён и виден только владельцу. Найдено
      и исправлено: ошибка связанного поля, появившаяся без касания (пароль для режима password,
      город при очном формате), молча блокировала Save — теперь неверные поля помечаются
      тронутыми, ошибка видна и получает фокус. Интерфейс проверен в Chromium с подменой API.
- [x] **49.10. 🧑‍💻 Разработчик:** резервная копия, `npm run db:push` для новой миграции, затем
      `npm run db:types` (с новым токеном из 49.8; без него типы сгенерирует 🤖 из базы). До
      миграции `/api/me` читает несуществующую колонку `password` и отвечает ошибкой. Сделано
      пользователем 03.10.2026, типы сгенерированы через API.
- [x] **49.11. 🤖 ИИ:** браузер не предлагает сохранить пароль страницы при каждом Save в Account
      (запрос пользователя 11.10.2026). Сделано 11.10.2026: поле Password — `type="text"`
      с `autocomplete="off"`, символы прячет `-webkit-text-security: disc` (Chrome, Safari,
      Firefox 114+); менеджер паролей браузера ищет поля `type="password"` и этого не видит.
      Проверено в Chromium в ките: точки вместо символов, глаз показывает пароль, полей
      `type="password"` на странице нет.
- [x] **49.12. 🧑‍💻 Разработчик:** в своём браузере сохранить настройки Account со скрытой
      страницей по паролю: предложения сохранить пароль нет.
      Проверено пользователем 11.10.2026, предложения сохранить пароль нет.

**Готово, когда:** скрытая страница не показывает гостю ни имени, ни фото, а по паролю
открывается на 30 дней.

#### Шаг 50. Оформление страницы: пресеты и обложки в Storybook
Решения пользователя 03.10.2026: психолог выбирает пресет оформления — фон за карточкой
и карточку одним выбором; главная кнопка во всех пресетах остаётся розовой кнопкой бренда
(`cta`); загрузку своих картинок для обложки и фона откладываем. Граница между страницей
и сайтом — раздел 3.1 `PRODUCT.md`. Сначала макеты в ките, без изменений в БД: так их дёшево
переделать.

- [x] **50.1. 🤖 ИИ:** шкалы `sage` и `sky` в палитре; пресеты Classic (как сейчас), Paper,
      Lavender, Orchid, Sage и Sky — токены `globals.css` для светлой и тёмной темы: фон за
      карточкой, карточка, `accent` (хайлайт), `secondary` (выделенная ссылка), заливка баннера.
      Обёртка страницы с фоном и карточкой; обложки Banner (полоса цвета пресета, фото на её
      краю) и Hero (большое фото, имя под ним, без фото — Banner) в `ProfileCard` по уже
      сохранённому `profile.cover`. Истории: пресеты × обложки в обеих темах, новые шкалы
      на странице токенов. Контраст текста на карточке и в выделении — не ниже 4.5:1.

      Сделано 03.10.2026: шкалы `sage` и `sky` повторяют светлоту шагов `violet`; пресеты —
      раздел «Оформление личной страницы» в `globals.css` (атрибут `data-page-theme`, утилиты
      `bg-page-backdrop` и `bg-page-banner`), список — `pageThemeIds`. Обёртка `ProfileCanvas`
      (пока только в ките), обложка `PageCover`; подсказка под Page cover в настройках
      описывает Banner и Hero. Контраст пар во всех пресетах: текст на карточке от 5.2:1,
      приглушённый текст в выделении от 4.6:1, выделенная ссылка от 5:1, обводка фокуса от 7.6:1.
      Истории `Widgets/Profile appearance`: Overview (6 × 3), каждый пресет, Banner, Hero, Hero
      без фото; осмотрены в Chromium на 1500 и 390 px в обеих темах. Без карточки (Classic)
      страница выглядит как раньше; Banner и Hero вне `ProfileCanvas` берут цвета Classic.
- [x] **50.2. 🧑‍💻 Разработчик:** посмотреть пресеты и обложки в ките, утвердить или назвать
      правки. Обложки читают сохранённый выбор, поэтому после коммита страницы с Banner и Hero
      сразу получат новый вид. Утверждено пользователем 03.10.2026 без правок.

**Готово, когда:** пресеты и обложки утверждены в ките в обеих темах.

#### Шаг 51. Оформление страницы: данные и редактор
- [x] **51.1. 🤖 ИИ:** миграция для всех настроек оформления: `page_theme` (`classic`
      по умолчанию, CHECK), `link_icons` (`true`), `cta_placement` (`inline` или `sticky`,
      `inline` по умолчанию). `PUBLIC_PROFILE_COLUMNS` и `grant select` для `anon`, общая
      zod-схема, `PATCH /api/profile`, `getProfileChanges`, `toPreviewProfile`, демо-профиль.
      Блок Appearance в разделе Public profile: пресеты — образцы цветов в `RadioGroup`, обложки —
      карточки со схемой вместо Select Page cover, сводка свёрнутого блока. Пресет на странице,
      в превью и в виде скрытой страницы для владельца; фон за карточкой доходит до подвала.
      Переключатель Phone / Desktop в рамке превью настроек. Фото для Hero: кроп сейчас 512 px
      (`AVATAR_SIZE`), на экране с двойной плотностью карточке нужно около 900 — поднять
      до 1024 (сервер уже принимает до 1024).

      Сделано 03.10.2026: миграция `20261003151107_add_page_appearance.sql`, поля `pageTheme`,
      `linkIcons`, `ctaPlacement` во всех слоях (их вид — шаги 52–53). Блок Appearance (`AppearanceBlock`) над конструктором:
      пресеты — образцы в настоящих цветах, обложки — схемы (баннер — в цветах выбранного
      пресета), сводка «Sage · Banner», сворачивается как блоки конструктора. `ProfileCanvas`
      на странице, в превью настроек и у владельца скрытой страницы; холст доходит до подвала.
      Рамка превью: панель с подписью Preview и выбором ширины Desktop / Phone (390 px, только
      на широком экране). Кроп фото — `AVATAR_CROP_SIZE` 1024 px; фото провайдеров по-прежнему
      запрашиваем по 512 px (`AVATAR_SIZE`): Facebook может прислать больше 1024, и сервер его
      не принял бы. Миграция проверена на боевой базе в транзакции с откатом: у трёх профилей
      значения по умолчанию, неверные пресет и место кнопки отклоняются, верные принимаются,
      `anon` читает новые колонки. `database.types.ts` дополнен вручную ровно тем, что даст
      генерация. Проверено в Chromium: блок Appearance в обеих темах и в колонке 22rem, выбор
      пресета и обложки, переключатель Phone; `/demo` на прод-сборке — Classic как раньше,
      холст до подвала на 1280 и 390 px.

      **До коммита:** без миграции код читает несуществующие колонки, и личные страницы,
      `/api/me` и настройки отвечают ошибкой (кроме `/demo`).
- [x] **51.2. 🧑‍💻 Разработчик:** резервная копия (`npm run db:dump`), `npm run db:push`,
      затем `npm run db:types`. Миграция применена: 04.10.2026 🤖 проверил на проде —
      `/api/profiles/ivan-v` отдаёт `pageTheme`, `cover`, `linkIcons` и `ctaPlacement`.
- [x] **51.3. 🧑‍💻 Разработчик:** выбрать каждый пресет и обложку, сохранить, открыть
      страницу на телефоне и компьютере в обеих темах. Проверено пользователем 04.10.2026,
      замечаний нет. Заодно по его просьбе превью настроек на телефоне — без рамки и полей
      вокруг: шириной с экран, как сама страница (рамка осталась только при превью рядом
      с формой).

- [x] **51.4. 🤖 ИИ:** карточка пресета на телефоне (запрос пользователя 09.10.2026): во всю
      ширину экрана, без рамки, скругления и отступа от шапки; на компьютере — как раньше.
      Сделано 09.10.2026: «телефон» — страница уже 32rem, как у закреплённой кнопки (шаг 53),
      поэтому превью Phone в настройках показывает так же. У Classic карточки нет, его отступы
      не меняются. Владельцу скрытой страницы под пометкой «Your page is hidden» — отступ 1rem.
      Проверено в Chromium в ките: 390 px, 1200 px и превью шириной 390 px на широком экране.
      10.10.2026 по просьбе пользователя убран и отступ от карточки до подвала.
- [x] **51.5. 🧑‍💻 Разработчик:** проверить карточку на телефоне в нескольких пресетах.
      Проверено пользователем 11.10.2026 (в том числе без отступа до подвала), замечаний нет.
- [x] **51.6. 🤖 ИИ:** отступы контента у Classic — как у остальных пресетов (запрос
      пользователя 11.10.2026). Сделано 11.10.2026: у Classic та же невидимая карточка
      с отступом 24 px, на телефоне — тоже во всю ширину. Раньше на телефоне у Classic было
      16 px по бокам и 40 px сверху, у пресетов — 24 и 24; на компьютере контент Classic
      стоял на 24 px выше. Проверено в Chromium в ките: Classic и Paper совпадают на 390
      и 1200 px.
- [x] **51.7. 🧑‍💻 Разработчик:** сравнить Classic и любой другой пресет на телефоне
      и компьютере.
      Проверено пользователем 11.10.2026, отступы совпадают.

**Готово, когда:** психолог выбирает пресет и обложку, и посетитель видит их на странице.

#### Шаг 52. Иконки на кнопках ссылок
- [x] **52.1. 🤖 ИИ:** одноцветные логотипы платформ ссылок и WhatsApp своими SVG в `currentColor`
      (как `auth-provider-icon.tsx`, без новой зависимости), для сайта, почты и телефона —
      lucide. Иконки у ссылок, главной кнопки и кнопок карточек услуг, `aria-hidden`; галочка
      Link icons в блоке Appearance, по умолчанию включена. Storybook.

      Сделано 09.10.2026: `PlatformIcon` в `entities/social-link` — пути simple-icons 16 (CC0),
      LinkedIn — из simple-icons 9 (из новых версий его убрали по просьбе бренда); сайт — `Globe`,
      почта и телефон — `Mail` и `Phone`. Иконки у ссылок (`SocialLinkButton` с `showIcon`),
      главной кнопки и кнопок услуг (`ContactAction.target`). Галочка Show icons on buttons
      в Appearance. Истории `Widgets/Profile card` → LinkIcons, WithoutIcons. Проверено
      в Chromium в собранном ките.
- [x] **52.2. 🧑‍💻 Разработчик:** проверить иконки во всех пресетах, выключение и сохранение.
      Проверено пользователем 11.10.2026, иконки работают.

**Готово, когда:** иконки видны на кнопках и выключаются одной галочкой.

#### Шаг 53. Главная кнопка внизу экрана на телефоне
- [x] **53.1. 🤖 ИИ:** выбор Contact button on phones в блоке Appearance: Under the name
      или Pinned to the bottom (виден, если выбран предпочтительный способ связи). Закреплённая
      кнопка — `sticky` в конце карточки: в конце страницы она встаёт на место и не закрывает
      подвал, в превью прилипает к низу рамки. Узкий экран определяет container query по
      ширине страницы, а не экрана, поэтому режим Phone превью показывает его честно. На каждой
      ширине одна из двух копий кнопки скрыта `display: none`: скринридер видит одну. Подложка
      цвета карточки пресета, отступ под жесты iOS. Storybook.

      Сделано 09.10.2026: «телефон» — страница уже 32rem (`@max-lg/page`, контейнер
      `ProfileCanvas`). Закреплённая копия — последний элемент карточки, подложка `bg-background`
      (в карточке это её цвет) во всю ширину карточки, снизу
      `max(0.75rem, env(safe-area-inset-bottom))`. В превью настроек на телефоне кнопка встаёт
      над панелью Save (`--page-cta-offset`). Без `ProfileCanvas` (онбординг) кнопка всегда под
      именем. Выбор Under the name / Pinned to the bottom виден при выбранном способе связи.
      История `Widgets/Profile appearance` → PinnedContactButton; в Chromium: кнопка прилипает
      к низу рамки 390 px, в конце встаёт на место, ссылок «Message on WhatsApp» столько же,
      сколько при Under the name (скрытая копия не видна скринридеру).
- [x] **53.2. 🧑‍💻 Разработчик:** проверить на телефоне (Safari на iOS, Chrome на Android):
      прокрутка, конец страницы, поворот экрана.
      Проверено пользователем 11.10.2026, замечаний нет.

**Готово, когда:** на телефоне главная кнопка закреплена внизу или стоит под именем — как
выбрал психолог.

#### Шаг 54. Валюта и место в настройках аккаунта
Запрос пользователя 10.10.2026: валюту и место указывают в Settings → Account, в Public profile
их больше не выбирают, а цены сами берут валюту профиля. Решения пользователя: место видно
на странице (блок Location остаётся в конструкторе — значение и ссылка в Account), для In person
город обязателен (без города в Account галочка неактивна), пока валюта не выбрана — USD.

- [x] **54.1. 🤖 ИИ:** миграция `20261010134213_use_profile_currency.sql`: валюта профиля —
      прежняя колонка `price_currency` (не переименована, чтобы код на проде не сломался),
      пустые значения заполнены валютой карточек услуг или USD, по умолчанию USD, ограничение
      «сумма только вместе с валютой» снято, валюта в цене карточки услуги необязательна.
      Заодно закрыта дыра в CHECK карточек: цена без суммы (`{}`) проходила. Проверено на боевой
      базе в транзакции с откатом: у всех трёх профилей валюта заполнена (одна — из карточек),
      неверная валюта отклоняется, сумма без валюты принимается, у новых профилей USD, старые
      карточки с валютой проходят новую проверку. Код: поле `currency` в схеме, API, превью
      и странице (`toStoredService`, `toProfileService`); Account — Country, City и Currency;
      в Public profile блок Location — значение и ссылка в Account, Price и цены карточек — сумма
      с подписью валюты, In person без города неактивен со ссылкой в Account. Тесты схем,
      `getProfileChanges` и `toPreviewProfile`. Проверено в Storybook: истории `Widgets/Profile
      form` (AccountSection, Settings, SettingsEmpty) показывают новые поля и состояния.
- [x] **54.2. 🧑‍💻 Разработчик:** резервная копия (`npm run db:dump`), `npm run db:push`, затем
      `npm run db:types` (типы не должны измениться: колонка та же). **До коммита:** без миграции
      новый код не сохранит профиль без цены сессии (ограничение пары) и карточку с ценой.
      Прежний код с миграцией работает.
      Сделано пользователем 11.10.2026: миграция применена, типы не изменились.
- [x] **54.3. 🧑‍💻 Разработчик:** проверить на проде: в Account выбрать страну, город и валюту,
      сохранить; в Public profile цена и карточки услуг — в этой валюте, In person без города
      неактивен, ссылки ведут в Account; на странице цена в новой валюте.
      Проверено пользователем 11.10.2026 на проде, замечаний нет.

**Готово, когда:** валюта и место выбираются в Account, а цены страницы и превью — в валюте
профиля.

### Этап E. Главная страница

<a id="step-16"></a>

#### Шаг 16. Главная страница
- [x] Минимальная главная (решение 11): заголовок, кнопки «Войти» и «Пример страницы».
      Лендинг с примером карточки и блоком «как это работает» — позже, если решим.
- [x] SEO: описательные `title` и `<h1>` главной вместо просто «Freudin».
### Этап E2. Полировка

#### Шаг 17.2. Ошибки и состояния
- [x] **🤖 ИИ:** `error.tsx` и `global-error.tsx`: своя страница ошибки с кнопкой «Try again» и
      адресом поддержки (`SupportEmailLink`) вместо стандартной страницы Next. Это файлы роутинга,
      их добавим в правила AGENTS.md. Сделано 29.09.2026: view `error` на `ErrorState`
      (`shared/ui`), повтор — `retry()` из Next 16. `global-error.tsx` рисует свои html и body,
      тему и шрифты, заголовок вкладки — элементом `<title>`. Проверено в браузере: сломанный
      ответ `/api/profiles/demo` даёт `error.tsx` с шапкой, сломанный `/api/me` (шапка
      в корневом layout) — `global-error.tsx`.
- [x] **🤖 ИИ:** единые состояния на всех экранах: скелетоны при загрузке, пустые состояния,
      ошибка загрузки с кнопкой «Try again». Сделано 29.09.2026: `ViewerGuard` и личная страница
      показывают `ErrorState`; повтор возвращает скелетон (у запроса без данных TanStack Query
      сам переходит в `pending`). Пустые состояния уже были: поиск города («Start typing…»,
      «No cities found», ошибка), документы, незаполненные блоки страницы скрыты.
- [x] **🤖 ИИ:** сбой сети и таймауты `apiClient` (`network_error`): понятные тексты, без обрыва
      форм. Сделано 29.09.2026: таймаут 30 с (загрузка файлов — 120 с) через `AbortSignal.any`,
      тексты «Can’t reach the server. Check your connection and try again.» и «The server is
      taking too long to respond. Please try again.». Проверено: обрыв сети при сохранении
      настроек — тост, введённое осталось, кнопка снова активна.
- [x] **🤖 ИИ:** тосты: единые тексты и длительность, без дублей. Тосты с ошибкой, предупреждением
      или о несработавшем действии (например, не удалось привязать способ входа) держатся в 2 раза
      дольше обычных (решение пользователя 28.09.2026). Сделано 29.09.2026: `toast`
      из `@/shared/ui/sonner` (обычный 4 с, ошибка и предупреждение 8 с, id — текст, поэтому
      одинаковый тост заменяет прежний), импорт `toast` из `sonner` запрещён в Biome. Тексты
      «Couldn’t copy the link» дополнены до «… Please try again.».

**Готово, когда:** на любом экране сбой API или ошибка рендера дают понятное сообщение и способ
повторить.

#### Шаг 17.9. Индикаторы ожидания
Выделен из шага 17.2 28.09.2026: маленькая самостоятельная итерация. Подход уже есть у кнопок
Connect в настройках (`sign-in-methods.tsx`): «Redirecting…» и сброс ожидания на `pageshow`.

- [x] **🤖 ИИ:** ожидание при входе: после клика по кнопке провайдера показывать в ней спиннер и
      текст «Redirecting to Google…», а все кнопки входа делать неактивными, чтобы не было
      повторного клика. Сейчас кнопка никак не реагирует: `/api/auth/sign-in` на проде отвечает за
      ~0,4 с (замер 26.09.2026), при холодном старте функции дольше. Состояние сбрасывать на
      `pageshow` с `persisted`: иначе при «Назад» со страницы провайдера браузер достанет страницу
      из bfcache с крутящимся спиннером. Клик с Cmd/Ctrl открывает новую вкладку, состояние он не
      включает. Сделано 29.09.2026: остальные кнопки гаснут (`aria-disabled`), повторный клик
      и Enter не уходят. Проверено в браузере и в истории `Widgets/Sign in panel` → Pending.
- [x] **🤖 ИИ:** ожидание при выходе: сейчас пункт меню закрывается, и до перезагрузки страницы
      ничего не видно. Показывать «Signing out…» тостом из меню и спиннером на кнопке в настройках.
      Сделано 29.09.2026: `toast.loading`, ошибка заменяет его тем же id; кнопка в настройках
      ждёт до перезагрузки страницы.
- [x] **🤖 ИИ:** единый индикатор ожидания в кнопках: `Spinner` из shadcn
      (`npx shadcn add spinner`) рядом с текстом («Saving…», «Deleting…», «Signing out…»), кнопка
      неактивна, пока идёт запрос. Сейчас у части кнопок только текст, у части — ничего.
      Сделано 29.09.2026: Save, Upload, Preparing, Delete (документ и аккаунт), Done в кропе,
      Connect и Disconnect, Sign out. Спиннер скрыт от скринридеров: состояние объявляет текст.
      В ките — `Components/Spinner` → InButtons.
- Не делаем: отдельный экран-лоадер между провайдером и сайтом (там только серверные редиректы,
  наша страница в это время не отображается, а промежуточная страница добавила бы ещё
  один переход) и полосу загрузки при переходах (страницы открываются мгновенно, данные
  закрыты скелетонами). На `/login` кнопки не прячем, пока грузится `/api/me`: гость, которых
  там большинство, ждал бы их лишние ~0,4 с.

**Готово, когда:** каждое действие с ожиданием (вход, выход, сохранение, удаление) сразу
показывает, что запрос идёт.

#### Шаг 17.3. Favicon и логотип
- [x] **🤖 ИИ и 🧑‍💻 Разработчик:** логотип. Сейчас в шапке название «Freudin» текстом. Нужен ли знак
      при минималистичном дизайне (решение 11)? Решено 28.09.2026: знака нет, логотип — надпись
      `freud.in` с розовой точкой.
- [x] **🤖 ИИ:** предложить 2–3 варианта иконки сайта (и знака, если он нужен) в SVG. Сделано
      28.09.2026: временная история `Freudin/Logo Concepts` в ките
      (`src/shared/ui/logo-concepts.stories.tsx`) с вариантами «Кушетка» (шезлонг психоаналитика
      с валиком), «Диалог» (две половины круга на разной высоте) и «Точка» (надпись `freud.in`
      с розовой точкой, иконка «f.»), а по просьбе пользователя ещё «Психея» (буква ψ: ножка
      с «головой» в чаше — человек в раскрытых руках) и «Арка» (дверной проём с восходящим
      солнцем — безопасное пространство). У каждого: шапка, фавиконки 16 и 32 px, иконка приложения,
      обе темы. После выбора знак переезжает в `Logo` и `src/app/icon.svg`, историю удаляем.
- [x] **🧑‍💻 Разработчик:** логотип — «Точка» (`freud.in` с розовой точкой), выбрано 28.09.2026.
      Иконка «f.» на фиолетовой плитке отклонена: похожа на Facebook.
- [x] **🤖 ИИ и 🧑‍💻 Разработчик:** фавиконка. Из вариантов «.in», «F.» и «Dot» 🧑‍💻 выбрал
      28.09.2026 «Dot»: розовая точка из логотипа на фиолетовой плитке, правее и ниже центра.
- [x] **🧑‍💻 Разработчик:** утвердить вариант иконки и логотипа, который я предложу, или дать
      свой в SVG.
- [x] **🤖 ИИ:** иконки сайта: `src/app/icon.svg` (или `.png`) вместо стандартного `favicon.ico`
      из create-next-app, `apple-icon.png` 180×180. Версию для тёмной темы — по необходимости.
      Заодно иконка 1024×1024 для приложения Meta (шаг 9.21). Стандартный `favicon.ico` удалить
      (перенесено из шага 17.7). Сделано 28.09.2026: `icon.svg`, `apple-icon.png` (квадрат без
      скругления) и `favicon.ico` с той же точкой вместо стандартного — его запрашивают напрямую
      старые браузеры и сервисы. Тёмная версия не нужна: фиолетовая плитка видна на любой
      панели. Временная история с концепциями удалена.
- [x] **🤖 ИИ:** картинка превью `opengraph-image.jpg` в новом стиле: сейчас на ней «Freudin»
      белым по чёрному, без палитры и логотипа `freud.in`. Сделано 29.09.2026: кремовый фон,
      логотип `freud.in` с розовой точкой, подзаголовок из `siteConfig.description` в две строки,
      всё по центру: квадратная обрезка в мессенджерах и 2:1 в X ничего не срезают. Alt обновлён.
- [x] **🤖 ИИ:** иконка приложения Meta 1024×1024 для шага 9.21: `docs/brand/meta-app-icon-1024.png`
      (29.09.2026), тот же знак, что у `apple-icon.png`. Точка остаётся внутри и при круглой
      обрезке.
- [x] **🤖 ИИ:** `src/app/manifest.ts`: название, цвета темы, иконки 192 и 512 px. Статические
      metadata-файлы добавим в правила AGENTS.md. Сделано 29.09.2026: цвета из `themeColors`
      (шаг 17.8), иконки `public/icon-192.png` и `icon-512.png` отрисованы из `icon.svg`
      в Chromium, плюс `icon-maskable-512.png` — квадрат без скругления для Android (точка
      в безопасной зоне). `display` не задан: сайт открывается в браузере, а не как приложение.

#### Шаг 17.4. Английский интерфейс
Решение 16: весь интерфейс на английском, русский не остаётся.

- [x] Правила: в AGENTS.md и README записать, что тексты интерфейса и `message` ошибок API
      пишем на английском, а документацию и комментарии — по-прежнему на русском.
- [x] Каркас: `lang="en"`, `openGraph.locale: "en_US"`, `siteConfig` (описание), `title`
      и `description` всех страниц, `opengraph-image.alt.txt`.
- [x] Картинка превью `opengraph-image.jpg`: на ней подзаголовок по-русски, нужна английская
      версия того же размера (1200×630). Перерисована в той же сетке и тем же шрифтом Geist.
- [x] Тексты интерфейса во всех слоях (около 50 файлов): подписи, плейсхолдеры, тосты,
      `confirm`, `aria-label`, `alt`, пустые состояния и 404. В справочнике соцсетей
      «ВКонтакте» → «VK», «Сайт» → «Website».
- [x] Ошибки: тексты ошибок входа (`auth-errors.ts`), `message` в ответах API, сообщения
      zod-схем, `ApiError` на клиенте (`network_error`). Логи сервера тоже на английском.
- [x] Кириллицу в шрифте Geist оставляем: имена и описания пользователей могут быть на любом
      языке. Транслитерация подсказки адреса из кириллического имени тоже остаётся.
- [x] Юридические тексты уже на английском. Названия, на которые они ссылаются (Settings →
      Delete account), должны совпасть с новыми подписями интерфейса.
- [x] Проверка: в строках `src` не осталось кириллицы (кроме комментариев), все страницы
      просмотрены в обеих темах. Сделано 26.09.2026, проверено в headless Chromium.

**Готово, когда:** на сайте нет русского текста, кроме пользовательских данных, а правила
в AGENTS.md обновлены.

#### Шаг 17.6. Вес JS и библиотеки
- [x] **🤖 ИИ:** (аудит) вес JS: главная грузит 341 КБ gzip, из них 97 КБ — zod со всеми
      локалями. Импорт `import * as z from "zod"` вместо `import { z }` даёт 277 КБ (−19%,
      замерено). Дальше — убрать zod из `apiClient`: ответ с ошибкой можно проверить без схемы.
      Сделано 29.09.2026: `import * as z`, в `apiClient` — проверка типа без zod, а главное —
      `"sideEffects": ["*.css"]` в `package.json`: без него сборщик тащил на каждую страницу всё
      из `index.ts` слайсов (схемы профиля и zod на главной). Все 48 снимков страниц после этого
      совпали с прежними.
- [x] **🤖 ИИ:** отчёт о составе бандла по страницам, до и после оптимизации. Инструмент — по
      возможности без новых зависимостей. Сделано 29.09.2026: JS, который страница грузит сама
      (скрипты из её HTML, gzip, Resource Timing в Chromium), прод-сборка HEAD `c07ebec` → после:

      | Страница | До | zod | sideEffects | Ленивые кроп и QR |
      |----------|---:|----:|------------:|------------------:|
      | `/` | 313 | 252 | 212 | 213 |
      | `/login` | 315 | 253 | 215 | 216 |
      | `/demo` | 328 | 267 | 228 | 224 |
      | `/privacy` | 324 | 263 | 223 | 223 |
      | `/onboarding` | 397 | 336 | 332 | 321 |
      | `/settings` | 398 | 337 | 336 | 326 |

      Состав главной после: React, React DOM и роутер Next — около 120 КБ, TanStack Query
      и меню шапки (Radix) — 22, sonner и next-themes — 22, `cn` — 15, остальное — код сайта.
      В настройках один чанк 112 КБ: форма, zod, dnd-kit и cmdk — они нужны на экране сразу.
- [x] **🤖 ИИ:** ленивая загрузка редких частей: кроп фото (`react-easy-crop`) — только после
      выбора файла, тяжёлые диалоги — по открытию. Сделано 29.09.2026: `next/dynamic` для
      области кропа (−10 КБ настройкам и онбордингу) и QR-кода в Share (−4 КБ личной странице),
      заглушки того же размера. Диалог документа не выносили: его форма и zod уже загружены
      формой настроек. Побочный эффект: фокус в диалоге кропа встаёт на кнопку закрытия,
      а не на ползунок — область подгружается после открытия.
- [x] **🤖 ИИ:** проверить tree-shaking `radix-ui`, `lucide-react` и TanStack, а также то, что
      devtools TanStack Query не попадают в прод-сборку. Проверено 29.09.2026 поиском по чанкам:
      неиспользуемых компонентов Radix, лишних иконок и `InfiniteQuery` нет, devtools нет.
- [x] **🤖 ИИ:** (ревью) замер скорости на проде: Lighthouse (mobile) для `/`, `/demo` и
      настоящей личной страницы — LCP, TBT, CLS. Цифры записать в этот шаг. По LCP личной
      страницы 🧑‍💻 решает, переносить ли её серверный рендер из этапа G в MVP. Замерено
      29.09.2026, Lighthouse 12, медиана трёх прогонов. Настоящей личной страницы в документах
      нет, `/demo` идёт тем же путём (HTML → JS → `/api/profiles/demo`), только без базы.

      | Где | Страница | Оценка | LCP | TBT | CLS |
      |-----|----------|-------:|----:|----:|----:|
      | прод (HEAD) | `/` | 97 | 2.3 с | 95 мс | 0 |
      | прод (HEAD) | `/demo` | 83 | 3.4 с | 63 мс | 0.18 |
      | локально, HEAD | `/` | 90 | 3.7 с | 12 мс | 0 |
      | локально, после 17.6 | `/` | 95 | 2.9 с | 4 мс | 0 |
      | локально, HEAD | `/demo` | 77 | 4.2 с | 29 мс | 0.19 |
      | локально, после 17.6 | `/demo` | 82 | 3.5 с | 4 мс | 0.19 |
      | локально, серверный рендер | `/demo` | 93 | 3.3 с | 15 мс | 0 |
      | локально, серверный рендер | настоящая личная страница | 95 | 2.9 с | 12 мс | 0 |

      LCP личной страницы — абзац «О себе»: он появляется только после запроса к API. CLS 0.18 —
      подвал: короткий скелетон держит его в первом экране, карточка сталкивает вниз.
- [x] **🧑‍💻 Разработчик решает:** по замеру выше — переносить ли серверный рендер `/<username>`
      из этапа G в MVP (лечит и LCP, и CLS) или пока поправить только CLS: скелетон карточки
      высотой в экран, тогда подвал не прыгает. **Решено 30.09.2026:** серверный рендер в MVP.
      Сделано 30.09.2026 (подробности — в этапе G): профиль приходит в HTML, CLS 0 (строки
      «серверный рендер» в таблице выше), скелетон карточки удалён.
- [x] **🤖 ИИ и 🧑‍💻 Разработчик:** (ревью) `/privacy` и `/terms` без клиентского JS. Их
      чанки весят около 20 КБ gzip (сборка 29.09.2026), а в них лишь текст, который уже есть в HTML.
      Хуков в этих view и в `legal-document` нет, поэтому правка — убрать `"use client"` из этих
      файлов. Это исключение из правила «весь UI клиентский»: 🧑‍💻 решает, нужно ли оно, и если да,
      записываем его в AGENTS.md. **Решено 30.09.2026:** да. Сделано 30.09.2026: исключение
      записано в AGENTS.md; JS при первом заходе — 215 КБ gzip, как у главной (до правки — на 10 КБ
      больше неё).

**Готово, когда:** главная и личная страница грузят заметно меньше JS; цифры до и после записаны
в этом шаге.

#### Шаг 17.7. Удаление неиспользуемого
- [x] **🤖 ИИ:** неиспользуемые компоненты shadcn в `shared/ui` (сейчас нигде не импортируется
      `card`) и лишние экспорты public API слайсов. Сделано 29.09.2026: `card` удалён; из public
      API убраны неиспользуемые значения (`countryCodeSchema`, `concernLabels`,
      `contactEmailSchema` и другие схемы полей, `AVATAR_MAX_BYTES` и `profileUpdateSchema`
      на клиенте, `normalizeSocialLinkUrl`, `viewerQueries`, `getViewerHomePath`,
      `authProviders` на сервере, `errorResponse` и `jsonError` в `api/_lib`). Типы оставлены:
      в рантайме они ничего не стоят и описывают данные.
- [x] **🤖 ИИ:** неиспользуемые файлы, экспорты и зависимости: разовая проверка (например,
      `npx knip`) без добавления инструмента в проект. Сделано 29.09.2026: `npx knip@5`.
      Неиспользуемых зависимостей нет (`react-dom`, типы, плагин React Compiler и `vite` нужны
      неявно). Скрипт `generate-cities-migration.mjs` запускается вручную — оставлен. Лишние
      экспорты в файлах shadcn и в сгенерированных типах БД не трогали.

### Этап E3. Темизация

#### Шаг 17.8. Дизайн-токены в одном месте

Что есть сейчас (27.09.2026):
- цвета уже заданы токенами shadcn в `src/app/globals.css` (`:root` и `.dark`), компоненты
  используют семантические классы (`bg-background`, `text-muted-foreground`). Радиусы считаются
  от одной переменной `--radius`;
- вне токенов: `themeColor` в `layout.tsx` (`#ffffff` и `#0a0a0a` повторяют `--background`),
  затемнение под диалогами `bg-black/10` в `dialog.tsx` и `alert-dialog.tsx`, ползунок
  `bg-white` в `slider.tsx`;
- типографика и размеры заданы классами по месту: заголовок страницы
  `font-semibold text-2xl tracking-tight` повторяется 8 раз, отступ страницы `py-10` — 11 раз,
  ширину контента (`max-w-sm`, `md`, `lg`, `3xl`, `5xl`) каждый view выбирает сам;
- шрифт подключается в `layout.tsx` (Geist в `--font-sans`), Geist Mono не используется;
- токены `sidebar-*` и `chart-*` от shadcn не используются.

- [x] **🧑‍💻 Разработчик решает:** где лежит «одно место». **Решено 27.09.2026 (решение 18):**
      `src/app/globals.css`, разбитый на разделы с комментариями: палитра светлой и тёмной темы,
      шрифты, типографика, размеры и отступы, радиусы. Туда же пишут `npx shadcn add`
      и `npx shadcn apply`, а генераторы тем для shadcn (например, tweakcn) выдают CSS, который
      вставляется в этот файл как есть. Отдельный `theme.css` отклонён: новые переменные CLI
      shadcn дописывал бы в `globals.css`, и переносить их пришлось бы руками.
- [x] **🤖 ИИ:** цвета: только семантические токены (фон, текст, `primary`, `muted`,
      `destructive`, `border`, `ring` и т. п.) в светлом и тёмном вариантах. Вместо захардкоженных
      значений: токен `--overlay` для затемнения под диалогами, существующий токен для ползунка.
      Правка файлов shadcn здесь оправдана. Сделано 29.09.2026: `bg-overlay` в `dialog.tsx`
      и `alert-dialog.tsx` (то же `rgb(0 0 0 / 10%)` в обеих темах), ползунок — `bg-popover`:
      в светлой теме тот же белый, в тёмной — цвет окна вместо белого.
- [x] **🤖 ИИ:** шрифты: в CSS — переменные `--font-sans`, `--font-heading` и `--font-mono`, а
      сами шрифты подключаются в одном модуле. `next/font` принимает в вызове только литералы,
      поэтому выбор шрифта остаётся кодом, а не значением в CSS. Сменить шрифт — поменять импорт в
      этом модуле. Подмножество `cyrillic` обязательно. Заодно убрать неиспользуемый Geist Mono
      (аудит, перенесено из шага 17.7): он даёт 2 из 4 предзагрузок шрифтов на каждой странице.
      Сделано 29.09.2026: модуль `src/app/fonts.ts` (его же берут `layout.tsx` и Storybook),
      предзагрузок стало 2. Geist Mono оказался не совсем неиспользуемым: им были набраны `code`
      в `/privacy` и `/terms`, теперь там системный моноширинный (`--font-mono`). Заголовки
      получили `font-heading`, пока он равен `--font-sans`.
- [x] **🤖 ИИ:** типографика: именованные размеры текста в `@theme`. Токен `--text-*` вместе
      с `--line-height`, `--letter-spacing` и `--font-weight` даёт один класс на всё
      (Tailwind 4.3 это поддерживает, проверено): например, `text-page-title`,
      `text-section-title`, `text-body`, `text-caption`. На них переходят заголовки страниц
      и разделов и типографика юридических текстов (`LegalDocument`). Сделано 29.09.2026:
      `text-page-title`, `text-section-title`, для документов — `text-document-title`,
      `text-document-heading`, `text-document`. `text-body` и `text-caption` не заводили:
      обычный текст — шкала Tailwind (`text-sm`, `text-base`), её токены переопределяются там же.
      Единственное видимое отличие — у h3 в `/privacy` трекинг, как у остальных заголовков
      разделов.
- [x] **🤖 ИИ:** размеры и отступы: общий шаг сетки `--spacing` (0.25rem по умолчанию, меняет
      все отступы сразу), именованные ширины (`--container-page` для `Container`,
      `--container-form`, `--container-prose`) и отступ страницы (`--spacing-page` → `py-page`).
      Views используют их вместо `max-w-lg` и `py-10`. Сделано 29.09.2026: ширина сайта названа
      `--container-site`, а не `page`: Tailwind для `max-w-page` взял бы `--spacing-page`.
      Колонки — `form`, `document`, `profile` (карточка личной страницы) и `sign-in`. Чтобы `cn`
      знал эти имена (иначе `max-w-form` не перекрывал `max-w-site`, а `text-page-title`
      терялся рядом с цветом текста), его таблицы теперь собирает `cn build` из классов проекта
      и `@theme` (`withCn` в `next.config.ts`, плагин в Storybook). Таблицы стали меньше:
      3.4 КБ gzip вместо 5.2. Компоненты shadcn берут `cn` из `@/shared/lib/utils`, прямой
      импорт пакета запрещён в Biome. 30.09.2026 по решению пользователя вернули стандартный
      `cn`: сборка таблиц — лишняя сложность ради одного места. Ширину колонки теперь задаёт
      проп `width` у `Container`, и `cn` склеивать её не нужно; запрет в Biome снят.
      Заодно `class-variance-authority` заменён своей `cva` в `shared/lib` (тот же API, поведение
      сверено с библиотекой), зависимость удалена.
- [x] **🤖 ИИ:** значения вне CSS: `themeColor` в `layout.tsx` и цвета `manifest.ts` (шаг 17.3)
      CSS-переменные прочитать не могут. Держим их в `shared/config/theme.ts` с пометкой,
      от какого токена они взяты. По возможности расхождение ловит проверка в `npm run lint`
      (небольшой скрипт без новых зависимостей). Сделано 29.09.2026: `themeColors`
      в `shared/config/theme.ts`, у `--background` в `globals.css` пометка о повторе. Проверку
      в `npm run lint` не делали: повторён один цвет в двух темах. Вернуться к ней, если
      повторов станет больше.
- [x] **🤖 ИИ:** убрать неиспользуемые токены `sidebar-*` и `chart-*`, чтобы файл темы легко
      читался. Если они понадобятся компоненту shadcn, CLI добавит их снова.
- [x] **🤖 ИИ:** правило в AGENTS.md («Стили и UI»): цвета, шрифты, размеры текста, ширины и
      отступы страниц задаём только токенами. Сырые цвета (`bg-white`, `text-red-500`, hex)
      допустимы только в файле темы и в логотипах брендов. Biome классы Tailwind не проверяет,
      поэтому при ревью — поиск по коду.
- [x] **🤖 ИИ:** README, раздел «Тема»: где лежат токены и как поменять основной цвет, шрифт,
      радиус, размеры текста и плотность отступов. После смены цветов — проверка контраста WCAG AA
      (шаг 17.1) и новая картинка превью: `opengraph-image.jpg` статичная, её перерисовывает
      🤖 ИИ (генерация из токенов — этап G).
- [x] **🤖 ИИ:** проверка. Пока дизайн минималистичный (решение 11), значения токенов равны
      текущим, и сайт выглядит как раньше: сверяю скриншоты всех страниц в обеих темах до и после
      (headless Chromium). Затем пробная правка, например цветной `--primary` и другой `--radius`:
      она должна поменять весь сайт и откатиться правкой одного файла. Пробную правку покажу тебе.
      🧑‍💻 проверил смену темы локально 30.09.2026.
      Сделано 29.09.2026: 48 снимков прод-сборки (12 страниц и состояний, в том числе `/settings`
      и `/onboarding` с подменённым `/api/me`, диалоги Share и кропа фото; 390 и 1280 px; обе
      темы) до и после совпали попиксельно, кроме трёх осознанных отличий: ползунок в тёмной
      теме, `code` и h3 в юридических текстах. Пробная правка `--primary`, `--radius`,
      `--text-page-title` и `--spacing-page` поменяла все страницы и откатилась одним файлом.
      Страница токенов в ките показывает типографику, ширины и отступы.
- Не темизируем: цвета логотипов Google, Facebook и Telegram в `provider-icon.tsx` (правила
  брендов требуют оригинальных цветов) и белый фон при сжатии фото в `crop-image.ts` (это
  содержимое JPEG, а не интерфейс).

**Готово, когда:** цвета, радиус, размеры текста, ширины и отступы меняются правкой файла темы,
а шрифт — правкой модуля шрифтов, сразу на всех страницах и в обеих темах. В компонентах
не осталось захардкоженных значений, кроме перечисленных исключений.

<a id="step-23"></a>

#### Шаг 23. UI kit в Storybook
Решение пользователя 28.09.2026: базовые визуальные элементы собраны в UI kit на Storybook. Это
новая dev-зависимость, её упоминаем в README. Лучше делать после 17.8: кит показывает итоговые
токены.

- [x] **23.1. 🧑‍💻 Разработчик решает:** где смотреть кит — только локально (`npm run storybook`) или
      публиковать (отдельный проект Vercel с защитой, как у стенда). **Решено 29.09.2026:**
      публикуем (23.11).
- [x] **23.2. 🤖 ИИ:** установить Storybook через npm 11. Фреймворк для Next.js
      (`@storybook/nextjs-vite` или `@storybook/nextjs`): проверить совместимость с Next.js 16,
      React 19, React Compiler и Tailwind 4. Светлая и тёмная темы (класс `.dark`), шрифт Geist,
      скрипты `storybook` и `build-storybook`, папка `storybook-static` в `.gitignore` и в
      исключениях Biome. Сделано 28.09.2026: Storybook 10.6 с `@storybook/nextjs-vite` и Vite 8.
      Tailwind 4 подхватывается из `postcss.config.mjs`. React Compiler в ките не работает,
      компонентам он и не нужен. Тему ставит next-themes по тулбару, Biome пропускает
      `storybook-static` через `.gitignore`.
- [x] **23.3. 🤖 ИИ:** истории `*.stories.tsx` рядом с компонентами `shared/ui`: кнопки, поля,
      диалоги, меню, аватар, скелетоны, тосты, а также `Logo`, `Container`, `NotFoundState`,
      `SupportEmailLink`. Отдельная страница токенов: палитра, типографика, отступы, радиусы (шаг
      17.8). Сделано 28.09.2026: 21 файл историй. Нет историй у `card` и `tooltip`: сайт их не
      использует. `label`, `popover`, `command`, `input-group` и `separator` показаны внутри
      `Field`, `Combobox` и `Dropdown Menu`. На странице токенов палитра, шрифт и радиусы;
      типографика, ширины и отступы появились с токенами шага 17.8 (29.09.2026).
- [x] **23.6. 🤖 ИИ:** палитра пользователя от 28.09.2026 в токенах светлой темы
      (`globals.css`): фон `#FAF7F2`, текст `#292535`, карточки `#FFFFFF`, `primary`
      и `secondary` `#59456B`, `accent` `#F0EAF3`. Новые токены: `cta` `#F47C61` для главной
      кнопки (`Button` без `variant`) и `link` `#AD4739` для ссылок в тексте. `muted`
      и `muted-foreground` подобраны под тёплый фон: прежний серый давал 4.4:1. `themeColor`
      тоже `#FAF7F2`. Тёплый акцент `#F2DCD1` не используется: для него пока нет элементов.
- [x] **23.7. 🤖 ИИ:** бренд-кит (по запросу пользователя через brandkit 28.09.2026) и палитра
      тёмной темы. В `globals.css` добавлены примитивы — шкалы OKLCH `plum`, `coral`, `neutral`
      и `red` по 11 шагов, цвета бренда стоят в них без изменений (тёплый акцент `#F2DCD1` —
      `coral-200`). Семантические токены ссылаются на шкалы. Тёмная тема продумана отдельно:
      фон `neutral-950`, карточки `neutral-900`, активные элементы `plum-300`, ссылки
      `coral-300`. Попутно: `destructive` светлой темы стал темнее (`red-700`), иначе при
      наведении на кнопку удаления текст давал 3.8:1. Рамки полей и чекбоксов (`input`) теперь
      не ниже 3:1 (было 1.2:1, WCAG 1.4.11). Контраст всех пар проверен в браузере по
      вычисленным значениям обеих тем, шкалы показаны на странице токенов в ките.
      DTCG-файлы `tokens/*.json` не заводили: токены живут в `globals.css` (решение 18).
- [x] **23.8. 🧑‍💻 Разработчик:** посмотреть светлую и тёмную темы на сайте и в ките, особенно
      более заметные рамки полей и тёмно-красный `destructive`. Принято пользователем 29.09.2026.
- [x] **23.9. 🤖 ИИ и 🧑‍💻 Разработчик:** фиолетовый и розовый вместо кораллового и `#59456B`
      (запрос пользователя 28.09.2026). Шкалы `plum` и `coral` заменены на `violet` и `pink`.
      Из трёх вариантов (A «Lilac & Rose», B «Violet & Fuchsia», C «Iris & Orchid») пользователь
      выбрал C: фиолетовый `#4C429D`, розовый `#CF87CE` (главная кнопка), ссылки `#983F95`,
      выбранный элемент `#E7EAFE`. Пары проходят WCAG AA в обеих темах. Временный переключатель
      палитр в ките удалён. Тёплый акцент `#F2DCD1` ушёл вместе с шкалой `coral`.
- [x] **23.5. 🧑‍💻 Разработчик:** посмотреть кит. Посмотрел 29.09.2026: устройство кита подходит,
      замечание — тосты разных типов должны различаться цветом (23.10).
- [x] **23.10. 🤖 ИИ:** цвет тоста по типу (запрос пользователя 29.09.2026): успех — `violet-200`,
      ошибка — `red-200`, информация — как раньше (`popover`). Из предложенных для успеха
      `violet-200` и `pink-200` выбран фиолетовый: светло-розовый рядом со светло-красным
      ошибки почти не отличить. Сделано 29.09.2026: токены `success` и `error` с текстом
      `violet-900` и `red-900` (10:1), в тёмной теме — шаги 800 с текстом шага 50 (10:1): шаги
      900 сливались бы с фоном страницы. `Toaster` включает `richColors` и берёт цвета из
      токенов; предупреждение, которого пока нет на сайте, выглядит как информация. Проверено
      в ките в обеих темах, пары добавлены на страницу токенов.
- [x] **23.11. 🧑‍💻 Разработчик:** проект Vercel для кита, отдельный от сайта, из того же
      репозитория:
      - Add New → Project → репозиторий сайта, имя например `freudin-storybook`;
      - Framework Preset — Other, Build Command — `npm run build-storybook`, Output Directory —
        `storybook-static`, переменные окружения не нужны (сборка проверена без них);
      - Settings → Deployment Protection → Vercel Authentication, область — All Deployments:
        кит откроется только под твоим аккаунтом Vercel и не попадёт в поиск. На Hobby это
        бесплатно. Свой домен не нужен, хватит адреса `*.vercel.app`;
      - прислать адрес кита.

      Сделано 29.09.2026: https://freudin-storybook.vercel.app. Проверено: без входа в Vercel
      адрес отвечает 302 на страницу авторизации Vercel.
- [x] **23.12. 🤖 ИИ:** после 23.11 — адрес кита и как он публикуется в README и AGENTS.md.
      Сделано 29.09.2026: README (стек, «Дизайн», «Внешние сервисы», «Деплой»), AGENTS.md (стек,
      UI kit).

**Готово, когда:** `npm run storybook` показывает все компоненты `shared/ui` и токены темы в светлой
и тёмной темах, а опубликованный кит открывается только владельцу.

### Этап F. Запуск

<a id="step-18"></a>

#### Шаг 18. Прод
- [x] **18.1.** Vercel: домен `www.freud.in` подключён, `freud.in` редиректит на него. Переменные
      окружения Production задаются раньше, на шаге 5.
- [x] **18.2.** ~~Прод-URL во всех провайдерах и в Supabase~~ — закрыт 28.09.2026 как дубль: Google
      в In production и Telegram с прод-доменом готовы (шаги 8.1 и 10), перевод Facebook в Live —
      шаг 9.21.
- [x] **18.4.** (аудит) **🧑‍💻 Разработчик:** Vercel → Settings → Functions → регион `fra1`. Сейчас
      функции работают в `iad1` (Вашингтон), а база во Франкфурте: каждый запрос к базе пересекает
      Атлантику (порядка 90 мс). Переключено на `fra1` 26.09.2026.
- [x] **18.8.** ~~Защита ветки `main`~~ — перенесено в шаг 18.9 (28.09.2026): обязательный CI
      рассчитан на мерж из другой ветки, поэтому защита нужна вместе с работой в `dev`.
- (аудит) Отдельный проект Supabase для разработки и превью-деплои Vercel на нём — вынесено
  в шаг 18.9.

<a id="step-24"></a>

#### Шаг 24. Юнит-тесты критичной логики
Запрос пользователя 28.09.2026 (правило 4 `docs/workflows/process.md`: тесты пишем только по прямому запросу). E2e и
тесты интерфейса — по-прежнему только по отдельному запросу.

- [x] **24.1. 🤖 ИИ:** предложить фреймворк и список логики. Фреймворк — Vitest: для него есть
      руководство в документации Next.js 16
      (`node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`). Кандидаты:
      `getSafeRedirectPath` (open redirect), проверка same-origin в `withErrorHandling` (CSRF),
      проверка `state` входа Google и Telegram, правила username и зарезервированные адреса,
      `normalizeSocialLinkUrl`, zod-схемы профиля (с полями шага 20), `getProfileChanges`,
      `isAccountDeletionConfirmed`, `detectAvatarImage` и лимиты размеров, `transliterate` и
      `getProfileSuggestions`, `getOAuthErrorCode`.

      Сделано 04.10.2026: Vitest в окружении node, только чистая логика (без jsdom и React Testing
      Library). К списку добавлены `normalizeSectionOrder`, `toPreviewProfile` (нет закрытых данных),
      `profileUpdateSchema`, `toFieldErrors` и `toFormFieldName`; `detectAvatarImage` теперь
      `detectImage`. Проверку `state` входа не покрываем: это сравнение в роуте, тесту пришлось бы
      подменять `cookies()` из Next.
- [x] **24.2. 🧑‍💻 Разработчик решает:** утвердить фреймворк и список. Утверждено пользователем
      04.10.2026 без правок.
- [x] **24.3. 🤖 ИИ:** установить через npm 11, конфиг, скрипт `npm test`, тесты. README: стек,
      команды, покрытая логика. AGENTS.md: `npm test` в проверках, правило 4 — тесты этой логики
      поддерживаем при её изменении.

      Сделано 04.10.2026: `vitest` 4.1 (Vitest 5 требует `@types/node` 22+, а в проекте 20),
      `vitest.config.mts` (алиас `@/` штатной опцией Vite 8, `server-only` — пустой модуль),
      `npm test` = `vitest run`, 14 файлов `*.test.ts` рядом с модулями, 134 теста. Тесты ловят
      поломки: временно сломанные `getSafeRedirectPath`, `assertSameOrigin` и группы полей
      в `getProfileChanges` дали 5 упавших тестов. README — раздел «Тесты», AGENTS.md — правила 4
      и 5, стек, команды, код-стайл.
**Готово, когда:** `npm test` проходит локально и в CI, а список покрытой логики записан в README.

### Этап H. Юридические требования (отдельный этап)

Нужен до шага 18: без `/privacy` и `/terms` Meta не переведёт приложение в Live, а Google
не пропустит брендинг. Проверка приложений идёт днями, поэтому лучше не откладывать.
(аудит) Google в Supabase уже включён, поэтому сайт может собирать email, имя и фото: этап H
нужен до публичного анонса. С 26.09.2026 Google в статусе In production: зарегистрироваться
может любой аккаунт Google. Тексты `/privacy` и `/terms` опубликованы в тот же день (H.5).

- [x] **H.1. 🧑‍💻 Разработчик:** почта поддержки (решение 17). Адрес нужен для текстов `/privacy`
      и `/terms`, экрана согласия Google и приложения Meta. Сделано 26.09.2026: ящик
      `freudin.support@gmail.com`, адрес в коде и текстах. В `/privacy` и `/terms` провайдер
      почты — Gmail (Google), письма могут обрабатываться за пределами ЕС.
- [x] **H.3. 🧑‍💻 Разработчик:** прописать адрес в Google Branding и в Contact email приложения Meta
      (инструкция ниже, пункт 2). Сделано: подтвердил разработчик 28.09.2026.
- [x] **H.4.** Адрес поддержки в коде: `siteConfig.supportEmail`, ссылка в подвале, контакты в
      текстах `/privacy` и `/terms`, подсказка на странице ошибки (шаг 17.2). Сделано:
      `SupportEmailLink` в `shared/ui`, адрес в подвале и в текстах; страница ошибки — в шаге 17.2.
- [x] **H.5.** Тексты `/privacy` и `/terms`, раздел «Удаление данных» с инструкцией для Meta. Тексты
      — на английском (решение 16). **🧑‍💻 Разработчик:** оператор данных (ФИО, ИП или компания) и
      юрисдикция. Контактный email — `freudin.support@gmail.com`. Сделано 26.09.2026: тексты
      владельца опубликованы без Google Analytics и Meta Pixel (их на сайте нет), домен
      `www.freud.in` вместо `freudin.com`, дописаны публичный профиль, удаление аккаунта в
      настройках, провайдеры по именам (Supabase, Vercel, Gmail) и фактические cookies. Исходники с
      аналитикой — `docs/legal/*.draft.md`. Реквизиты оператора — `legalConfig` в `shared/config`, у
      разделов есть якоря (`/privacy#account-and-data-deletion`). Проверено в headless Chromium:
      один `<h1>`, заголовки по порядку, без горизонтальной прокрутки на 320 px.
- [x] **H.7.** Применимое право с учётом того, что база в ЕС (eu-central-1). Если появится аудитория
      из РФ, вернуться к 152-ФЗ (см. «Риски»). Решено: право Грузии, обязательные нормы страны
      пользователя (в том числе GDPR) — где требуется (решение 13).
- [x] **H.8.** (аудит) Пока текстов нет, закрыть `/privacy` и `/terms` от индексации (`noindex`) и
      убрать их из `sitemap.xml`: сейчас пустые страницы индексируются. Не понадобилось: тексты
      опубликованы, страницы остаются в индексе и в `sitemap.xml`.

#### Инструкция: почта поддержки `freudin.support@gmail.com`

Перенесена в `README.md`: «Внешние сервисы» → «Почта поддержки».

### Этап M. Ревью 12 октября UX

#### Шаг 55. Длинная ссылка в Bio ломает мобильную страницу.
Сценарий: допустимый по длине Bio содержит длинную ссылку без пробелов. На экране 320 px
текст выходит за карточку, а ширина страницы увеличивается до 1033 px. Ошибка есть и в превью.

- [x] **55.1. 🤖 ИИ:** ограничить ширину Bio и разрешить перенос длинных непрерывных строк
      в `ProfileCard`, сохранив абзацы и переводы строк.
- [x] **55.2. 🤖 ИИ:** проверить длинную ссылку и обычный текст на 320 и 390 px, в превью
      и на личной странице, с Highlight и без него, в светлой и тёмной темах.
      Проверено 15.10.2026 в Chromium через Storybook: общий ProfileCard в режиме страницы
      и превью, 320/390 px, обычный текст и длинный URL, Highlight вкл./выкл., обе темы —
      32 сочетания без горизонтальной прокрутки; текст и переводы строк сохранены.
- [x] **55.3. 🧑‍💻 Разработчик:** проверить страницу с длинной ссылкой на телефоне.
      QA 16.10.2026: PASS — превью `/settings` на 390 и 320 px в Chromium: Bio со ссылкой
      191 символ без пробелов переносится внутри карточки, с Highlight и без, прокрутки по
      горизонтали нет, после Preview → Edit текст в поле.

**Готово, когда:** Bio остаётся внутри карточки, читается целиком и не создаёт горизонтальную
прокрутку.

#### Шаг 57. На компьютере текстовые поля уже, чем на телефоне.
На ширине окна 1280 px Bio получает 277 px, описание услуги — 251 px, ответ FAQ — 237 px.
На телефоне 390 px эти поля шире: большая часть экрана компьютера отдана превью.

- [x] **57.1. 🤖 ИИ:** расширить колонку редактора примерно до 420–480 px там, где хватает
      места; сохранить удобную ширину превью и переключение Preview/Edit на узких экранах.
- [x] **57.2. 🤖 ИИ:** проверить Bio, услуги, FAQ и образование на 320, 390, 1024 и 1280 px,
      включая панель Save и длинные значения.
      Проверено 16.10.2026 в Chromium/Storybook: 320/390/1024/1280 px, длинные значения,
      обе темы, Preview/Edit и панель Save. С учётом сайдбара 224 px редактор на компьютере —
      448 px, Bio — 373 px против 332 px на телефоне 390 px; горизонтальной прокрутки нет.
- [x] **57.3. 🧑‍💻 Разработчик:** проверить написание и редактирование длинного текста
      рядом с превью на компьютере.
      QA 16.10.2026: PASS — `/settings` под учётной записью разработчика на 1280×900: Bio
      373 px, ответ FAQ 333 px, длинный текст вводится и правится, превью рядом, прокрутки
      по горизонтали нет, панель Save не перекрывает FAQ. Описание услуги (347 px) и 390/320 px —
      в Storybook: в профиле одна категория Works with, карточек услуг нет.

**Готово, когда:** текстовые поля используют доступную ширину компьютера, а форма и превью
не создают горизонтальную прокрутку.

#### Шаг 58. Заполненные поля теряют видимые названия.
В строках образования, услуг и FAQ часть полей названа только placeholder и `aria-label`.
После заполнения подпись исчезает; год, длительность и цену приходится узнавать по контексту.

- [x] **58.1. 🤖 ИИ:** добавить постоянные видимые подписи к полям образования, услуг
      и FAQ, связать их с полями через `htmlFor` и `id`. Сохранить сообщения ошибок
      и доступные названия кнопок управления строками.
- [x] **58.2. 🤖 ИИ:** проверить пустые и заполненные строки, добавление и перестановку
      строк, отображение ошибок и подписи на узком экране.
      Проверено 16.10.2026 в Chromium/Storybook: пустые и заполненные строки, добавление
      и удаление Education/Services/FAQ, перестановка FAQ, ошибки цены и обязательных полей.
      Все подписи связаны с полями, дублирующихся id нет; на 320 px переполнения нет.
- [x] **58.3. 🧑‍💻 Разработчик:** проверить, что назначение каждого поля понятно после
      заполнения, особенно Year, Duration, min и Price.
      QA 16.10.2026: PASS — `/settings` на 1280 и 320 px: заполненные Education, Services
      и FAQ сохраняют подписи (Year, Duration (min), Price с EUR, Question, Answer) при фокусе
      и после него, `label[for]` связаны с полями, дублей id и прокрутки по горизонтали нет.

**Готово, когда:** пользователь видит название поля независимо от его значения и фокуса.

<a id="step-59"></a>

#### Шаг 59. Оформление появляется раньше содержания страницы.
Раскрытый Appearance стоит перед содержанием и при первом заполнении сдвигает Bio примерно
на 1184 px от начала страницы. Выбор цветов и обложки предшествует рассказу о практике.

- [x] **59.1. 🤖 ИИ:** сворачивать Appearance по умолчанию для пользователя без сохранённого
      предпочтения; в сводке показывать выбранные тему и обложку. Существующее сохранённое
      состояние сворачивания не сбрасывать.
      Выполнено 16.10.2026: значение по умолчанию [appearance] используется только без
      записи пользователя. В браузере проверены сохранённые [] и списки свёрнутых блоков,
      переключение другого блока до Appearance, повторная гидратация и изоляция пользователей.
- [x] **59.2. 🧑‍💻 Разработчик:** проверить первый вход в редактор и повторный вход после
      ручного раскрытия Appearance на компьютере и телефоне.
      QA 16.10.2026: PASS — `/settings` на 1280 и 390 px: без сохранённого состояния Appearance
      свёрнут со сводкой «Paper · Classic», раскрытие держится после перезагрузки и перехода
      на `/ivan-v` и обратно, повторное сворачивание тоже сохраняется.
- [x] **59.4. 🤖 ИИ:** обозначать включённый Highlight в свёрнутой шапке блока текстом или
      доступным маркером; проверить включение, выключение и сохранение состояния.
      Выполнено 16.10.2026: сводка начинается с Highlighted · для выделенного блока.
      История Widgets/Profile form → SettingsCollapsed показывает маркер и свёрнутый Appearance.
      В браузере проверены включение/выключение и передача Highlight в onSubmit с восстановлением
      формы из сохранённых значений; это проверка фикстуры, не сохранение на production.

**Готово, когда:** содержание страницы доступно раньше подробных настроек оформления,
а выбор пользователя о сворачивании сохраняется.

<a id="step-61"></a>

#### Шаг 61. Search details перегружен и обещает результат раньше времени.
При работе с несколькими категориями клиентов доступны 77 запросов в 11 группах; на телефоне
раздел занимает около 3243 px. Превью публичной страницы не отражает эти закрытые данные,
а текст Used to match you with clients обещает уже работающий подбор.

- [x] **61.3. 🤖 ИИ:** объяснить, что данные сохраняются для будущего поиска и подбора,
      пока каталог и AI-ассистент не запущены; не обещать текущую передачу клиентов.
**Готово, когда:** выбранное легко проверить, закрытые данные не попадают в превью,
а описание соответствует реально работающим возможностям.

<a id="step-64"></a>

#### Шаг 64. Чек-лист неправильно оценивает заполненные цены.
Сценарий: формат работы выбран, услуги содержат цены и длительность, но общая цена профиля
не задана. Пункт Add your work format and price продолжает считать страницу незавершённой.

- [x] **64.1. 🤖 ИИ:** учитывать цены опубликованных услуг в проверке готовности чек-листа;
      не требовать общей цены, если условия уже описаны услугами. Ссылку незавершённого
      пункта направлять к действительно незаполненному блоку.
- [x] **64.2. 🤖 ИИ:** проверить общую цену, цены только в услугах, отсутствие цен
      и отсутствие формата работы. Скрытие подсказок владельцем должно продолжать работать.
      Проверено 16.10.2026 в Chromium/Storybook: восемь сочетаний общей цены, цен услуг
      и формата. Ссылки ведут к Format, Price или Services по недостающим данным; скрытие
      подсказок сохраняется после повторной гидратации хранилища.
- [x] **64.3. 🧑‍💻 Разработчик:** проверить чек-лист на своём профиле с несколькими услугами.
      QA 16.10.2026: PASS — на профиле @ivan-v сохранены две услуги с ценами без общей цены:
      чек-лист не просит формат и цену, услуги с ценами видны на странице. Без цен у услуг пункт
      Add your work format and price снова открыт и ведёт на `/settings#block-services`, блок
      раскрыт и виден (этот сценарий проверил основной агент: QA упёрся в лимит шагов). Профиль
      возвращён к исходному и сверен с `/api/profiles/ivan-v`.
**Готово, когда:** чек-лист признаёт заполненные условия работы и не просит добавить
искусственную общую цену. То же исправление закрывает шаг 70 этапа O.

### Этап N. Ревью 12 октября Dev

#### Шаг 68. Есть календарно зависимый тест возраста.
Сценарий: на 2028-02-29 helper существующего теста через setUTCFullYear получает 2010-03-01
вместо подходящей граничной даты рождения. Падает проверка минимального возраста;
подтверждена ошибка подготовки данных теста, а не производственной валидации возраста.

- [x] **68.1. 🤖 ИИ:** сделать тесты возрастных и календарных границ в `schemas.test.ts`
      независимыми от текущего дня: зафиксировать время через `vi.setSystemTime`, использовать
      явные даты рождения и восстанавливать часы после сценария.
- [x] **68.2. 🤖 ИИ:** в существующем наборе проверить обычную дату, 29 февраля,
      границу 18 лет и дату начала практики в будущем. Не менять производственное правило
      возраста только для получения зелёного теста и не отключать упавший сценарий.
      Выполнено 15.10.2026: явные даты на 2026-10-15, 2028-02-29, 2028-03-01 и 2026-02-28,
      vi.setSystemTime с восстановлением часов; правила production не менялись. npm test — 144/144.

**Готово, когда:** существующие тесты проходят одинаково в обычный и високосный день
и продолжают проверять реальные календарные границы.

### Этап O. Ревью 12 октября psy user

<a id="step-69"></a>

#### Шаг 69. Мне нужна небольшая помощь с содержанием биографии.
Пустое Bio и счётчик символов не помогают психологу объяснить клиенту, кому он помогает,
с какими трудностями работает и чего ожидать от сотрудничества.

- [x] **69.1. 🤖 ИИ:** добавить рядом с Bio короткие необязательные подсказки на английском:
      кому вы помогаете, с чем работаете, чего ожидать от сотрудничества. Сохранить лимит
      символов, свободу текста и существующие подсказки вопросов FAQ.
      Выполнено 15.10.2026: необязательная подсказка связана с Bio через aria-describedby;
      счётчик, лимит и свободный ввод сохранены.
**Готово, когда:** психологу понятно, о чём написать в Bio; подсказки не добавляют
обязательных полей и не требуют AI-сервиса шага 34.

<a id="step-71"></a>

#### Шаг 71. Ограничения скрытия страницы нужно объяснить рядом с переключателем.
В Privacy уже описано, что ранее полученные прямые адреса изображений могут открываться
после скрытия страницы. Решение о скрытии психолог принимает в Account рядом с Hide my page,
где этого пояснения нет.

- [x] **71.1. 🤖 ИИ:** добавить рядом с Hide my page короткое пояснение на английском:
      скрытие страницы не отзывает доступ по ранее сохранённым прямым ссылкам на изображения.
      Пояснить применение режима после Save; сохранить существующие режимы и предупреждение
      не использовать пароль от других аккаунтов.
      Выполнено 15.10.2026: пояснение видно до выбора режима и связано с переключателем
      через aria-describedby; прежняя подсказка пароля сохранена. Проверено в Storybook
      на 320 и 1280 px, включая выбор режима password.
**Готово, когда:** ограничения видны до сохранения режима, а описание в настройках
согласовано с Privacy и не обещает отозвать прямые ссылки на файлы.

### Этап P. lighthouse 12 октября

<a id="step-79"></a>

#### Шаг 79. Доступные имена оформления и последовательные заголовки
В отчёте Lighthouse от 12.10.2026 Accessibility настроек — 94: провалены имена шести
переключателей Theme и трёх Cover, после `h1` идёт `h3` Appearance. В проверке Codex Astra
имена не дали повторного сбоя, поэтому сначала сверяем сборку, браузер и метод проверки.
Пропуск заголовка остаётся; Accessibility личной страницы из исходного отчёта — 100.

- [x] **79.2. 🤖 ИИ:** привести заголовки Appearance и блоков `SortableBlocks`
      к последовательности `h1 → h2`, сохранив внешний вид, идентификаторы и связи
      `aria-labelledby`. Проверить Public profile, Account, Search details и превью.
      Выполнено 15.10.2026: Appearance, SortableBlocks и Sign-in methods используют h2,
      идентификаторы и классы сохранены. Проверено в Chromium/Storybook: разделы формы
      Public profile, Account, Search details; ProfileCard в превью не добавляет h1.
**Готово, когда:** `button-name` и `heading-order` проходят в настройках,
Accessibility обеих страниц — 100; названия и выбранное состояние доступны скринридеру.

### Этап Q. Сводное ревью 14 октября

#### Шаг 99. Описание готовых возможностей в PRODUCT.md
Раздел о состоянии продукта отстаёт от реализованных услуг, FAQ, редактора и оформления.
Источник: Grok.

- [x] **99.1. 🤖 ИИ:** сверить разделы состояния/возможностей `docs/PRODUCT.md` с кодом
      и отметками плана, исправить устаревший статус готовых функций. Решения и границы
      продукта в разделах 1–5 не менять без отдельного решения владельца.
- [x] **99.2. 🤖 ИИ:** проверить согласованность README и PLAN; новые предложения 85–93
      остаются будущими до решения и реализации, обновление описания не объявляет их готовыми.

**Готово, когда:** описание текущего продукта соответствует реализации, а будущие возможности
не смешаны с готовыми.

## Исходный контекст планирования

Сохранён для понимания старых задач; не является описанием текущего устройства системы.

## 1. Что строим (MVP)

- Регистрация и вход через **Google**, **Meta (Facebook Login)** и **Telegram**. Вход через
  **Apple** — после MVP (этап G, решение пользователя 28.09.2026).
- После первого входа идёт онбординг: пользователь указывает **фото, имя, описание**,
  выбирает **уникальную ссылку** (username) и добавляет **ссылки на соцсети**.
- Публичная личная страница `https://<домен>/<username>`.
- Редактирование профиля и управление аккаунтом: выход, удаление.

**Развитие (добавлено 28.09.2026).** Профиль дополняется данными психолога: подход, формат работы
(онлайн или офлайн), страна и город, языки и документы (шаги 20–21). На главной появляется поиск по
ним (шаг 22), у сайта — страницы «О нас» и «Контакты» (этапы I и J), UI kit в Storybook (шаг 23) и
юнит-тесты критичной логики (шаг 24). Входит ли это в MVP, то есть делается ли до ручной приёмки
(шаг 19) и публичного анонса, решает 🧑‍💻 Разработчик.

**Видение продукта (29.09.2026).** Что такое Freudin, для кого он и чего не делает, описано
в [`docs/PRODUCT.md`](../PRODUCT.md). По нему добавлены шаг 29 (данные психолога, часть 2), шаг 31
(главная из поиска, ленты и ассистента), этап K (лента постов из соцсетей) и этап L (AI: подбор
психолога и помощь с описанием «О себе»). Место этих шагов относительно MVP решает 🧑‍💻 Разработчик.

**Развитие визитки и редактора (01.10.2026).** По сравнению с Linktree и Taplink пользователь
согласовал собственные заголовки ссылок, FAQ психолога, карточки услуг для нескольких категорий
Works with, превью, статистику, хайлайт кнопок и блоков, три варианта обложки, сворачивание блоков
настроек с сохранением состояния, удобное сохранение и помощь после создания страницы (37–46).
Референсы и границы заимствования — в разделе 9 [`PRODUCT.md`](../PRODUCT.md).

**Оформление страницы (03.10.2026).** Пользователь согласовал пресеты оформления (фон за карточкой
и карточка одним выбором), вид трёх обложек, иконки на кнопках ссылок и главную кнопку,
закреплённую внизу экрана на телефоне (50–53). Оформление поднято в очереди выше каталога
и статистики. Граница между страницей психолога и дизайном сайта — в разделе 3.1
[`PRODUCT.md`](../PRODUCT.md).

**Сводное ревью (14.10.2026).** Полезные пересечения и уникальные замечания пяти отчётов
учтены в существующих шагах и новом этапе Q (81–100). Реестр после этапа Q связывает каждую
тему с задачей и источником. Продуктовые предложения проходят решение перед реализацией;
планирование не меняет текущие правила, не включает новые тесты без согласия и не означает
реализацию функций. Сохраняются очередь статистики (46) и задачи после MVP в этапе G.

## 2. Исходная точка

Проект создан через `create-next-app` 16.3.6:

- Next.js 16.3 (App Router в `src/app`, Turbopack, **React Compiler включён**), React 19.2, TypeScript 5;
- Tailwind CSS 4, Biome 2.4 (линтер и форматтер), npm;
- `AGENTS.md` с управляемым блоком Next.js. Его пересоздаёт `next dev`, поэтому блок не трогаем:
  он отправляет агентов читать документацию из `node_modules/next/dist/docs/`.
  `CLAUDE.md` содержит одну строку: `@AGENTS.md`.

## 3. Решения

Реестр решений со всеми номерами (1–18 со старта и следующие) перенесён в
[`docs/DECISIONS.md`](../DECISIONS.md). Ссылки «решение 16» в плане ведут туда.

## 4. Архитектура

### 4.1. Поток данных и правила клиент/сервер

```
Браузер: client components ('use client'), TanStack Query, Zustand
   │   fetch('/api/...'): клиент ходит только в собственные API-роуты
   ▼
src/app/api/**/route.ts: Route Handlers (Node.js), вся серверная логика
   │   @supabase/ssr (сессия пользователя в cookies) / admin-клиент (secret key)
   ▼
Supabase: Auth (google, facebook, custom:telegram) · Postgres + RLS · Storage (avatars)
```

- Клиент **никогда** не обращается к Supabase напрямую. Ключи Supabase лежат только в серверных
  env, без префикса `NEXT_PUBLIC_`.
- Серверные компоненты не загружают данные. Страницы и вся логика живут в клиентских компонентах
  слоёв `views` и ниже, а данные приходят только через `/api`.
- Сессию Supabase обновляют сами route handlers: в них можно писать cookies. Приватные страницы
  защищаются на клиенте: пока грузится `GET /api/me`, показываем скелетон, а без сессии
  перенаправляем на `/login`.
- RLS включён на всех таблицах, хотя клиент не ходит в Supabase напрямую. Это вторая линия защиты.

### 4.2. Авторизация

Facebook, Telegram и Apple (после MVP, этап G) проходят через один OAuth-поток Supabase (PKCE):

```
[Кнопка «Войти через …»]
  → GET /api/auth/sign-in?provider=facebook|telegram|apple&next=/…
      signInWithOAuth({ provider, options: { redirectTo, skipBrowserRedirect: true } })
      PKCE verifier сохраняется в cookie, затем 302 на провайдера
  → провайдер → https://<ref>.supabase.co/auth/v1/callback
  → GET /api/auth/callback?code=…&next=…
      exchangeCodeForSession(code), cookies сессии
      302: профиля нет → /onboarding; профиль есть → next или /<username>
```

Исключения — Google (шаг 8.1) и Telegram на https (шаг 10): они возвращают браузер на наш домен,
чтобы на экране провайдера был виден сайт, а не `<ref>.supabase.co`. Код общий
(`oidc-sign-in.server.ts`), колбэк — `/api/auth/callback/[provider]`. Схема на примере Google:

```
  → GET /api/auth/sign-in?provider=google&next=/…
      state, nonce, PKCE verifier и next — в httpOnly-cookie freudin-google-sign-in (10 минут)
      302 на accounts.google.com (redirect_uri — наш домен)
  → GET /api/auth/callback/google?code=…&state=…
      проверка state, код → токены Google (oauth2.googleapis.com/token)
      signInWithIdToken({ provider: "google", token, access_token, nonce }), cookies сессии
      302 — как в общем колбэке
```

- **Telegram** подключается как кастомный OIDC-провайдер Supabase `custom:telegram`: issuer
  `https://oauth.telegram.org`, scopes `openid profile`, `email_optional: true`. У Telegram
  появился вход через OpenID Connect (старый Login Widget теперь legacy), а Supabase поддерживает
  кастомные OIDC-провайдеры (на Free-плане до 3 штук).
  Telegram не отдаёт email, это нормально. Имя, фото и `preferred_username` приходят в
  `user_metadata`.
- **Facebook** требует разрешение `email`. Без Live-режима приложения войти могут только его
  тестировщики.
- Параметр `next` принимаем только как относительный путь, чтобы исключить open redirect.

### 4.3. Модель данных (Supabase)

Таблица `public.profiles`:

| Поле | Тип | Ограничения |
|------|-----|-------------|
| `id` | `uuid` PK | `references auth.users(id) on delete cascade` |
| `username` | `text` unique | 3–30 символов, `^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$`, не из списка зарезервированных |
| `display_name` | `text` | 1–60 символов |
| `bio` | `text` | до 500 символов |
| `avatar_path` | `text` null | путь в Storage: `avatars/<user_id>/<uuid>.webp` |
| `social_links` | `jsonb` | `[{ "platform": "telegram", "url": "https://t.me/…" }]`, не больше 10 |
| `created_at`, `updated_at` | `timestamptz` | `updated_at` обновляет триггер |

- RLS: `select` открыт всем (страницы публичные), `insert`/`update` доступны только владельцу
  (`auth.uid() = id`).
- Storage: публичный bucket `avatars` (лимит 2 МБ, jpeg/png/webp). Писать можно только в свою
  папку `<user_id>/`.
- Профиль создаётся явно, при отправке онбординга. Триггер на `auth.users` не используем:
  username обязателен, и его выбирает пользователь. «Регистрация завершена» = профиль существует.
- Миграции лежат в `supabase/migrations`. Типы генерируются в
  `src/shared/api/supabase/database.types.ts`.
- Данные психолога (страна, город, формат работы, с кем работает, подходы, языки, цена)
  и документы — шаг 20: колонки `profiles`, справочник городов `cities` (GeoNames), таблица
  документов и bucket `documents`. Правила полей — в пунктах 20.1–20.2.

### 4.4. Структура проекта (FSD)

Слои (импорт разрешён только сверху вниз): `app` → `views` → `widgets` → `entities` → `shared`.
Слоя `features` **нет**. Пользовательские сценарии (вход, редактирование, выход) собираются
в `widgets`, а API-хуки, мутации и модель лежат в `entities`. Слой `pages` заменён на `views`.

```
src/
├─ app/                      # Next.js App Router = FSD-слой app
│  ├─ layout.tsx             # html/body, шрифты, metadata, <Providers>
│  ├─ globals.css
│  ├─ _providers/            # QueryClientProvider, ThemeProvider, Toaster ('use client')
│  ├─ page.tsx               # export { HomeView as default } from '@/views/home'
│  ├─ login/page.tsx         # → views/login
│  ├─ onboarding/page.tsx    # → views/onboarding
│  ├─ settings/page.tsx      # → views/settings
│  ├─ privacy/page.tsx       # → views/privacy
│  ├─ terms/page.tsx         # → views/terms
│  ├─ [username]/page.tsx    # → views/profile
│  ├─ not-found.tsx          # → views/not-found
│  └─ api/                   # ВСЯ серверная логика (см. 4.5)
│     └─ _lib/               # хелперы route handlers: ответы и ошибки, requireUser, zod-парсинг
├─ views/        # home, login, onboarding, settings, profile, privacy, terms, not-found
├─ widgets/      # header, footer, sign-in-panel, profile-form, profile-card, account-settings
├─ entities/     # viewer (текущий пользователь), profile, social-link
└─ shared/
   ├─ ui/        # компоненты shadcn/ui
   ├─ lib/       # cn, хуки, работа с изображениями
   ├─ api/       # apiClient (fetch к /api), ApiError, QueryClient;
   │             # index.server.ts: клиенты Supabase (server-only) и сгенерированные типы
   └─ config/    # routes, site, reserved-usernames, env
```

Правила:

- Слайс импортируется снаружи только через public API: `index.ts`, а для серверного кода
  `index.server.ts` с `import 'server-only'`.
- Слайсы одного слоя друг друга не импортируют. Исключение для `entities`: кросс-импорт через `@x`.
- Сегменты внутри слайса: `ui`, `model` (типы, zod-схемы, Zustand-сторы), `api` (query keys,
  хуки TanStack Query, серверные функции `*.server.ts`), `lib`, `config`.
- Файлы в `src/app` остаются тонкими: `page.tsx` только реэкспортирует view, а `route.ts`
  разбирает HTTP (авторизация, валидация, коды ответов) и вызывает серверные функции сущностей.

### 4.5. Роуты

Страницы:

| Путь | View | Доступ |
|------|------|--------|
| `/` | `home` | все |
| `/login` | `login` | гости; авторизованных редиректим |
| `/onboarding` | `onboarding` | авторизованные **без** профиля |
| `/settings` | `settings` | авторизованные **с** профилем |
| `/<username>` | `profile` | все |
| `/privacy`, `/terms` | `privacy`, `terms` | все |
| `/about` | `about` | все (этап I, запланировано) |
| `/contact` или `/contacts` | `contacts` | все (этап J, запланировано) |

API:

| Метод | Путь | Назначение | Нужна сессия |
|-------|------|------------|:---:|
| GET | `/api/health` | проверка связки клиент → API | — |
| GET | `/api/auth/sign-in?provider=&next=` | старт OAuth, редирект к провайдеру | — |
| GET | `/api/auth/callback?code=&next=` | обмен кода на сессию, редирект | — |
| POST | `/api/auth/sign-out` | выход | ✓ |
| GET | `/api/me` | текущий пользователь, его профиль (или `null`) и подсказки для онбординга | ✓ (иначе 401) |
| DELETE | `/api/me` | удаление аккаунта и всех данных | ✓ |
| POST | `/api/profile` | создание профиля (онбординг) | ✓ |
| PATCH | `/api/profile` | обновление профиля | ✓ |
| POST | `/api/profile/avatar` | загрузка фото (multipart) или копирование фото провайдера | ✓ |
| DELETE | `/api/profile/avatar` | удаление фото | ✓ |
| GET | `/api/profiles/[username]` | публичный профиль | — |
| GET | `/api/usernames/[username]` | проверка, свободен ли username | — |
| GET | `/api/cities?country=&q=` | поиск города в стране по справочнику GeoNames (шаг 20, запланировано) | — |
| POST | `/api/profile/documents` | загрузка изображения документа (шаг 20, запланировано) | ✓ |
| DELETE | `/api/profile/documents/[id]` | удаление документа (шаг 20, запланировано) | ✓ |
| GET | `/api/profiles?approach=&format=&country=&city=&language=` | поиск психологов на главной (шаг 22, запланировано) | — |

Формат ошибок единый: `{ "error": { "code": "…", "message": "…", "fields": { … } } }`
с корректным HTTP-статусом (400, 401, 403, 404, 409, 413, 500).

### 4.6. Стек

| Задача | Выбор |
|--------|-------|
| Фреймворк | Next.js 16 (App Router), React 19, TypeScript 5 |
| Стили и UI | Tailwind CSS 4, shadcn/ui (CLI 4), lucide-react, next-themes, sonner |
| Серверное состояние | TanStack Query 5 |
| Клиентское состояние | Zustand 5: только UI-состояние и черновики, серверные данные не дублируем |
| Формы и валидация | TanStack Form 1 + zod 4. Одни и те же схемы используются в форме и в API |
| Backend | Route Handlers в `src/app/api`, `@supabase/ssr` + `@supabase/supabase-js` |
| БД, Auth, Storage | Supabase |
| Качество кода | Biome (линт и формат), `tsc`; тесты пишем только по запросу |
| Хостинг | Vercel |

#### Согласованный порядок развития (01.10.2026)

Номера шагов сохраняют порядок добавления; очерёдность реализации новых возможностей — ниже.
Обязательные проверки и задачи запуска из этапа F выполняются до публичного анонса.

| Очерёдность | Что делаем | Шаги |
|------------|------------|------|
| 1 | Собственные заголовки ссылок, корректные подписи действий, объяснение продукта на главной | 37, 16 |
| 2 | Сворачивание блоков с сохранением состояния, удобное сохранение, превью и помощь после создания страницы | 38–41 |
| 3 | FAQ психолога и карточки услуг для нескольких категорий Works with | 42–43 |
| 4 | Хайлайт и оформление страницы: пресеты фона и карточки, вид обложек, иконки ссылок, главная кнопка внизу экрана на телефоне | 44, 50–53 |
| 5 | Каталог психологов | 22; главная собирается по мере готовности в 31 |
| 6 | Минимальная статистика просмотров и кликов | 46, после каталога и появления трафика |
| 7 | Дополнительные медиа, свои картинки обложки и фона, лента и AI | этап G, 32–34; отдельные медиа — после уточнения сценария |

Опция трёх вариантов обложки (45) уже сохраняется в профиле, её вид рисует шаг 50. Оформление
поднято выше каталога и статистики решением пользователя 03.10.2026. Согласованные задачи
ещё не реализованы: их пункты остаются `[ ]`.

## Прежние сводки и закрытые вопросы

| ✅ Сделано | Решения раздела 3, доступ к `ui.shadcn.com`, юрисдикция (решение 13); проект Supabase, ключи, URL Configuration, провайдер Email выключен, тариф Supabase Free и копии через `npm run db:dump`; миграции; Google: OAuth-клиент, свой адрес возврата, Search Console, проверка бренда, In production; бот Telegram и его прод-домен; Allow manual linking и проверка привязки способов входа (10.2); регион функций `fra1`; почта поддержки, оператор данных и право для `/privacy` и `/terms`; адрес поддержки в Google Branding и Meta (H.3); где лежат токены темы и проверка смены темы (17.8); серверный рендер `/<username>` и `/privacy`, `/terms` без клиентского JS (17.6); Facebook в Live (9.21); проверки шагов 20, 21, 28, 29.5 и 36.2 на проде; публикация кита (23.1, 23.11), его просмотр (23.5) и темы (23.8) |

- **Серверный рендер личных страниц `/<username>`** — единственное осознанное исключение
  из правила «без server components». **Перенесён в MVP и сделан 30.09.2026** (шаг 17.6):
  профиль загружает `ProfilePage` на сервере, `generateMetadata` даёт `title` с именем,
  `description` из «О себе», canonical и Open Graph с фото (без фото — картинка сайта),
  нет профиля — настоящий 404, адрес с заглавными — редирект 308. Остались пункты ниже:
  `opengraph-image` с фото и именем (пока в превью просто фото), личные страницы в `sitemap.xml`,
  JSON-LD и кеш в CDN. Было до переноса — данные грузились в браузере, и из-за этого:
  - поисковики, которые не выполняют JavaScript, видят пустую страницу;
  - превью ссылки в мессенджерах и соцсетях одно на весь сайт, а не с фото и именем человека;
  - на несуществующий адрес сервер отвечает 200, а не 404 («мягкая 404»);
  - (ревью) содержимое появляется поздно: HTML → JS → `/api/profiles/[username]` → отрисовка, всё
    это время виден скелетон, а заголовок вкладки выставляет эффект после загрузки. Насколько это
    медленно, покажет замер в шаге 17.6.

  Далее: `opengraph-image` с фото и именем, личные страницы в `sitemap.xml` и JSON-LD
  по уточнённым задачам сводного ревью ниже. Metadata и настоящий 404 уже сделаны
  в 17.6; повторной реализации не требуют. Формы и остальной UI остаются клиентскими.
- Привязка нескольких способов входа к одному аккаунту — перенесено в шаг 10.2.
- Живое превью карточки в онбординге и настройках сделано в шаге 40 (01.10.2026).

| Экран согласия Google показывает `<ref>.supabase.co` | Свой адрес возврата на `www.freud.in` и проверка бренда (шаг 8.1) |
| Если аудитория в РФ, 152-ФЗ требует хранить персональные данные россиян на серверах в России, а Supabase за рубежом | ✅ Решено: пока считаем, что пользователи не из РФ (решение 13). Если аудитория изменится, вернёмся к вопросу на этапе H |
| Сетевая политика облачного окружения закрывает `ui.shadcn.com`, `*.supabase.co`, `api.supabase.com` | ✅ Снято: окружению открыт полный доступ в сеть |

## 8. Как работаем над шагом

1. Ты пишешь: «делаем шаг N».
2. Я реализую шаг и прогоняю `npm run lint:fix`, `npm run typecheck`, `npm test`
   (перед коммитом — `npm run build`).
3. Шаг с интерфейсом проверяет QA-агент (решение 26, цикл — в
   [`docs/workflows/qa-subagent.md`](../workflows/qa-subagent.md)): FAIL — исправляю и запускаю
   снова; PASS без ошибок и без нужды в живой проверке — отмечаю шаг (и подшаг 🧑‍💻 «проверить …») и пишу под ним «QA <дата>: PASS — что
   проверено»; что QA проверить не может, выношу в подшаг `🧑‍💻 Разработчик: проверить …`;
   QA не запустился — пишу «Ожидает QA: <причина>».
4. Обновляю `README.md` (и `AGENTS.md`, если поменялись стек или правила; `docs/architecture/`,
   если поменялась архитектура) и отмечаю шаг здесь. Правила шага плана —
   [`docs/workflows/plan-step.md`](../workflows/plan-step.md).
5. Git: в локальной сессии (CLI, VS Code) ветки, коммиты и push делаешь ты, я git не трогаю.
   В облачной сессии я коммичу и пушу в рабочую ветку. Интеграции ты проверяешь на localhost,
   а после мержа — на проде.

Юнит-тесты не пишем, пока ты не попросишь.


### Закрытые замечания сводного ревью

| Длинная строка Bio растягивает мобильную страницу | 55 | DeepSeek, Gemini, Codex Astra |
| Исчезающие видимые подписи заполненных полей | 58 | DeepSeek, Gemini, Codex Astra |
| Календарно зависимый тест возраста | 68 | DeepSeek, Gemini |
| На компьютере текстовые поля уже мобильных | 57 | Gemini, Codex Astra |
| Устаревшее описание реализованного в PRODUCT.md | 99 | Grok |
| Маркер Highlight в свёрнутом блоке | 59.4 | Gemini |

### Прежняя сводка приёмки завершённых шагов

| Шаги 37–45 | Проверки новых возможностей страницы и редактора на телефоне и компьютере; 43.1 — формат услуг и правило общей цены; миграции с резервной копией, где меняется БД |
| Шаги 50–53 | 50.2 — утвердить пресеты и обложки в ките; 51.2 — миграция с резервной копией; проверки на телефоне и компьютере |
