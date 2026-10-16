# История: этап C. Авторизация

[Индекс истории](README.md) · [Индекс плана](../../PLAN.md)

✅ Готово 08.10.2026: вход через Google и Telegram, привязка нескольких способов входа. Вход через
Facebook скрыт и перенесён в этап G (решение пользователя 08.10.2026): Meta не приняла документы
для подтверждения компании (9.18), без него приложение не пройдёт проверку разрешения `email`.

## Шаг 8. Общий OAuth-поток и Google
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

## Шаг 8.1. Название сайта на экране Google
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

## Инструкция: подтверждение `freud.in` в Google Search Console

Перенесена в `README.md`: «Вход через Google» → «Подтверждение домена в Google Search Console».

## Шаг 9. Meta (Facebook Login)
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

## Инструкция: приложение Meta для входа через Facebook

Перенесена в `README.md`, раздел «Вход через Facebook». Пункты шага 9 выше ссылаются на прежнюю
нумерацию: 1–6 — приложение Meta и провайдер в Supabase, 7 — проверка в режиме Development,
8 — Live. В README добавлен пункт про Require app secret, поэтому номера там сдвинулись.

## Шаг 10. Telegram
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

## Шаг 10.1. Apple (Sign in with Apple)
Перенесён в этап G 28.09.2026: разработчик пока не платит $99 в год за Apple Developer Program,
поэтому MVP обходится без Apple. План — в этапе G, раздел «Вход через Apple (бывший шаг 10.1)».

## Шаг 10.2. Несколько способов входа в одном аккаунте
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
