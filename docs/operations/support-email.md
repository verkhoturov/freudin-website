# Почта поддержки

Возврат к [обзору сервисов](../../README.md#внешние-сервисы); переменные окружения —
в [README](../../README.md#переменные-окружения).

`freudin.support@gmail.com` — обычный ящик Gmail. Через него пользователи просят удалить данные,
поэтому доступ к нему терять нельзя: держи на ящике двухфакторную аутентификацию и сохрани
резервные коды.

Где прописан адрес (меняя его, поменяй везде):

- код сайта — `siteConfig.supportEmail` в `src/shared/config/site.ts`: подвал, страница ошибки,
  `/privacy` и `/terms`;
- Google Cloud → Google Auth Platform → Branding → Developer contact information. Поле User
  support email показывает только адрес вошедшего аккаунта и его Google-группы: чтобы выбрать
  там ящик поддержки, добавь `freudin.support@gmail.com` в IAM проекта (роль Owner или Editor),
  войди под ним и выбери адрес;
- Meta for Developers → приложение → App settings → Basic → Contact email.

