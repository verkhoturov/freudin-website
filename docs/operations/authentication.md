# Настройка входа

Возврат к [обзору сервисов](../../README.md#внешние-сервисы); переменные окружения —
в [README](../../README.md#переменные-окружения). Сценарии и ограничения серверного кода —
в [динамических представлениях](../architecture/dynamic.md#вход-через-google-и-telegram)
и [api.md](../workflows/api.md).

## Вход через Google

1. Google Cloud → Google Auth Platform:
   - Branding: название, логотип, ссылки на `/privacy` и `/terms`;
   - Audience: External, статус In production: войти может любой аккаунт Google. В статусе
     Testing пускают только тестовых пользователей из этого же раздела. Название и логотип
     Freudin на экране Google видны после проверки бренда (brand verification). Бренд
     подтверждён. Для проверки домен `freud.in` подтверждён в Google Search Console
     TXT-записью в DNS: её не удалять (см. [подтверждение домена](#подтверждение-домена-в-google-search-console));
   - Data access: `openid`, `email`, `profile`.
2. Clients → Create client → Web application:
   - Authorized JavaScript origins: `http://localhost:3000` и `https://www.freud.in`;
   - Authorized redirect URIs: `https://www.freud.in/api/auth/callback/google`
     и `http://localhost:3000/api/auth/callback/google`. Адрес Supabase здесь не нужен.
3. Client ID и Client Secret внести в Supabase → Authentication → Sign In / Providers → Google
   и включить провайдер: Supabase проверяет по этому Client ID ID-токены Google. Skip nonce
   check оставить выключенным: мы передаём nonce, и Supabase его сверяет.
4. Те же Client ID и Client Secret задать в `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
   (`.env` и Vercel).

Как устроен вход — в [`docs/architecture/dynamic.md`](../../docs/architecture/dynamic.md#вход-через-google-и-telegram).

### Подтверждение домена в Google Search Console

Домен `freud.in` подтверждён: TXT-запись `google-site-verification=…` в DNS не удалять. Google
периодически перепроверяет её, без неё домен снова станет неподтверждённым, и проверка бренда
слетит. Инструкция ниже — если подтверждение придётся пройти заново.

DNS домена обслуживает Timeweb. Кроме подтверждения там SPF-запись
`v=spf1 include:_spf.timeweb.ru ~all` и записи сайта (A `216.198.79.1`, CNAME `www` на Vercel):
их не трогаем.

1. **Аккаунт.** Открой https://search.google.com/search-console под тем Google-аккаунтом,
   который владеет проектом в Google Cloud (роль Owner или Editor). Проверка бренда
   засчитывает только домены, подтверждённые таким аккаунтом.
2. **Ресурс.** Добавить ресурс → слева тип **«Доменный ресурс»** → `freud.in` (без `https://`
   и без `www`). Такой ресурс покрывает и `www.freud.in`. Тип «Ресурс с префиксом в URL»
   не подходит.
3. **Код.** Search Console покажет запись вида `google-site-verification=…`. Скопируй её
   целиком и не закрывай окно.
4. **TXT в Timeweb.** Домены → `freud.in` → DNS-записи → Добавить запись: тип — TXT, поддомен
   (хост) — пустой или `@`, значение — скопированная строка без кавычек, TTL — по умолчанию.
   SPF-запись не редактируй: у домена может быть несколько TXT-записей.
5. **Ожидание.** Обычно запись видна через несколько минут, иногда через несколько часов.
   Проверить: `dig +short TXT freud.in` — в ответе должны быть SPF и `google-site-verification`.
6. **Подтвердить.** Вернись в Search Console и нажми «Подтвердить». Если запись ещё не видна,
   закрой окно: ресурс останется в списке неподтверждённым, проверку можно повторить позже.
7. **Дальше.** Google Auth Platform → Branding → Authorized domains: `freud.in`. В Search
   Console → Файлы Sitemap отправь `https://www.freud.in/sitemap.xml`.

## Вход через Facebook

**Выключен:** Meta не приняла документы для подтверждения компании (Business verification),
а без него приложение нельзя перевести в Live. `facebook` убран из `enabledAuthProviders`
(`src/entities/viewer/config/auth-providers.ts`): кнопки на `/login` нет, в настройках Facebook
не виден, даже если привязан, и способом входа не считается. Код и настройки в Meta и Supabase
сохранены.

Включить провайдер — добавить его в `enabledAuthProviders`. Для Facebook сначала подтверди
компанию в Meta и переведи приложение в Live (пункт 9 ниже). Как устроен вход —
в [`docs/architecture/dynamic.md`](../../docs/architecture/dynamic.md#особенности-провайдеров).

Настройка приложения Meta:

1. **Аккаунт разработчика.** Войди на https://developers.facebook.com личным аккаунтом Facebook
   (с 2FA) → Get Started. Meta попросит подтвердить телефон или email.
2. **Приложение.** My Apps → Create app: App name — `Freudin`, App contact email —
   `freudin.support@gmail.com`, use case — «Authenticate and request data from users with
   Facebook Login», Business portfolio можно подключить позже.
3. **Разрешения.** Use cases → Authenticate and request data… → Customize → Permissions:
   `public_profile` уже есть, у `email` нажми Add. Для этих двух разрешений App Review не нужен.
4. **Facebook Login → Settings** (там же, Customize → Settings):
   - Client OAuth login, Web OAuth login, Enforce HTTPS, Use Strict Mode for redirect URIs — Yes;
   - Valid OAuth Redirect URIs — `https://<ref>.supabase.co/auth/v1/callback`
     (`<ref>` — из `SUPABASE_URL`);
   - Login with the JavaScript SDK — No.
5. **App settings → Basic:** App domains — `freud.in`; Contact email —
   `freudin.support@gmail.com`; Privacy Policy URL — `https://www.freud.in/privacy`; Terms
   of Service URL — `https://www.freud.in/terms`; Data deletion instructions URL —
   `https://www.freud.in/privacy#account-and-data-deletion`; Category — например, Lifestyle;
   App icon 1024×1024 — `docs/brand/meta-app-icon-1024.png`; Add platform → Website → Site URL
   `https://www.freud.in`. App ID и App secret нужны в пункте 7: секрет не присылай в чат и не
   клади в репозиторий.
6. **App settings → Advanced → Security:** Require app secret — выключен, иначе Graph API
   требует `appsecret_proof` и не отдаёт фото 512×512.
7. **Supabase** → Authentication → Sign In / Providers → Facebook: Enable, Facebook client ID —
   App ID, Facebook secret — App secret; вход без email разрешён
   (`external_facebook_email_optional`). Callback URL в этом окне должен совпадать с адресом
   из пункта 4.
8. **Режим Development.** Пока приложение не в Live, войти могут только люди с ролью в нём.
   Тестировщиков добавляй в App roles → Roles → Testers, они принимают приглашение на
   developers.facebook.com.
9. **Live.** App Mode → Live (Publish). Meta проверит поля из пункта 5 и потребует бизнес-портфель
   с подтверждённой компанией. У `email` в Permissions нажми Get advanced access, если кнопка
   есть: иначе почту получат только люди с ролью в приложении. Раз в год Meta просит пройти
   Data Use Checkup, без него доступ приложения ограничат.

## Вход через Telegram

Telegram подключён через OpenID Connect как свой провайдер Supabase (`custom:telegram`).
На проде он входит, как Google, через наш адрес возврата: на экране Telegram виден
`www.freud.in`. На localhost вход идёт через OAuth Supabase: BotFather не принимает `http://`.
Как устроен вход — в [`docs/architecture/dynamic.md`](../../docs/architecture/dynamic.md#вход-через-google-и-telegram).

1. @BotFather: `/newbot` — отдельный бот только для входа (`@freudin_bot`). В мини-приложении
   BotFather: бот → Bot Settings → Web Login → OpenID Connect Login. Переключение необратимо:
   старый Login Widget у этого бота больше не работает.
2. Там же: Redirect URIs — `https://www.freud.in/api/auth/callback/telegram` и
   `https://<ref>.supabase.co/auth/v1/callback` (для входа на localhost), Trusted Origins —
   `https://www.freud.in`. BotFather показывает Client ID и Client Secret (это не токен бота).
   Адреса с `http://` BotFather не принимает.
3. Supabase → Authentication → Sign In / Providers → New Provider → Auto-discovery (OIDC):
   Identifier `custom:telegram`, Issuer URL `https://oauth.telegram.org`, scopes
   `openid profile`, PKCE включён, вход без email разрешён (Telegram email не отдаёт).
   Supabase по этим настройкам проверяет ID-токены Telegram. На тарифе Free можно до трёх
   своих провайдеров.
4. Те же Client ID и Client Secret задать в `TELEGRAM_CLIENT_ID` и `TELEGRAM_CLIENT_SECRET`
   (`.env` и Vercel).

## Несколько способов входа в одном аккаунте

В Supabase → Authentication → Sign In / Providers включён **Allow manual linking**: без него
привязка и отвязка не работают. В Google Cloud, BotFather и Meta ничего дополнительно
не настраивается: привязка возвращает браузер на те же адреса, что и вход.

Если способ входа уже привязан к другому аккаунту Freudin, привязка вернёт ошибку
`identity_already_exists`: аккаунты не объединяются. Чтобы привязать способ, второй аккаунт
нужно удалить (у аккаунта без страницы кнопка удаления есть на онбординге).

