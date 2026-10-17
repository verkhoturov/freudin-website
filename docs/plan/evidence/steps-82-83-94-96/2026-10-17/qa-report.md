# QA-отчёт

Проверен `http://localhost:3100` на фиктивном стенде; код не менялся. Все критерии A–J выполнены.

- **A — PASS.** Во всех трёх разделах `View my page` виден и ведёт на `/qa-anna` при 1280×900 и 390×844. В Account при 320×800 горизонтальной прокрутки нет (`scrollWidth=320`).
- **B — PASS.** `Username` изменён на `qa-anna-renamed`. До сохранения ссылка оставалась на прежней странице; `Save your changes?` → `Stay` сохранял ввод. `Save and continue` перевёл на `/qa-anna-renamed`; после reload страница доступна с title `Anna Example — Freudin`, а ссылка в settings обновилась. Навигация между разделами не сбрасывала Bio; `Stay` сохранил черновик, `Discard changes` вернул сохранённый текст.
- **C — PASS.** Проверены пояснения о немедленной загрузке/удалении и сохранении Highlight/порядка только через Save. Файл загружен с Caption `QA sample diploma`; появилось `Document added`, документ остался после reload, а `Save` для одной загрузки не включился. После изменения Highlight и порядка `Unsaved changes` отображалось; `Discard changes` вернул сохранённые значения, не удалив документ.
- **D — PASS.** При `documentError=true` загрузка показала `Fictional document upload failure. Please try again.` без ложного `Changes saved`. В диалоге `Delete document?` пояснение сообщало о немедленном удалении и невозможности восстановления через Discard; `Cancel` сохранял документ. Ошибка удаления показала `Fictional document deletion failure. Please try again.`, документ остался. После успешного удаления он отсутствовал и после reload; уведомление — `Document deleted`.
- **E — PASS.** На Account Save и `Sign-in methods`/`Sign out`/`Delete account` визуально разделены; в шапке сказано `Save applies to changes in all settings sections.` `Sign out` → `Stay` не отправил запрос сохранения и оставил Bio в форме. Диалог удаления аккаунта открыт; `Delete` не нажимался.
  - **E1 — PASS.** `Save and continue` из диалога `Sign out` сохранил `Saved before sign out`, перевёл на главную и установил `owner=false`.
  - **E2 — PASS.** `Connect Telegram` → `Stay` не открыл провайдера и не отправил POST `/api/auth/identities`. Повторный `Connect Telegram` → `Save and continue` открыл `/__qa/provider` с `Fictional sign-in provider`; Bio сохранился, POST `/api/auth/identities` был ровно один.
  - **E3 — PASS.** При `saveError=true` после `Save and continue` показано точное сообщение `Fictional save failure. Please try again.`; остались в settings, `owner=true`, черновик Bio сохранился в форме. Затем `Sign out` → `Discard changes` перевёл на главную и установил `owner=false`.
- **F — PASS.** При `visibility=private` владелец видел `Anna Example` и title `Anna Example — Freudin`; `Change in Settings` открывал title `Settings — Freudin`, возврат — снова страницу владельца. Для гостя показан `Hidden page` с title `Hidden page — Freudin`, имени нет. При `visibility=password` владелец видел страницу; гость — `Protected page`, title `Protected page — Freudin` и поле `Password`. В серверном HTML закрытых страниц `Anna Example` отсутствовало в разметке, скриптах и исходном HTML.
- **G — PASS.** При задержке `/api/me` до ответа title был `Hidden page — Freudin`, затем сменился на `Anna Example — Freudin`. При умышленном `meError=true` имя не появилось, title остался нейтральным. Задержка и ошибка стенда сняты после проверки.
- **H — PASS.** Для `/demo` в HTML найдены оба реальных ответа FAQ; оба trigger изначально закрыты. Закрытый content имел `hidden=true`, высоту `0`; в интерактивном snapshot закрытый ответ не отображался. Проверены `aria-expanded`, связи `aria-controls`/`aria-labelledby`, открытие по клику, закрытие Enter, открытие Space, переход фокуса на второй trigger через ArrowDown. Оба ответа можно открыть одновременно и закрывать независимо.
- **I — PASS.** В `Answer 1` введено 1000 символов без Save. В Preview первый ответ раскрылся, текст переносился; горизонтальной прокрутки страницы не было. На 390×844 FAQ в Preview также раскрылся без горизонтального переполнения. После `Edit` черновик длиной 1000 символов сохранился.
- **J — PASS.** Account и FAQ проверены в светлой и тёмной темах. Для Account и FAQ на контрольных размерах 320×800, 390×844 и 1280×900 горизонтальной прокрутки не выявлено; на проверенных реальных страницах один `h1`. Клавиатурный фокус FAQ был виден (`:focus-visible=true`, outline отображался). Финальные `errors` и `console` — без вывода; неожиданных render/hydration ошибок не обнаружено.

**Умышленные ответы стенда в network log:** гостевой `/api/me` — 401; тестовые ошибки `/api/me`, сохранения профиля и загрузки/удаления документа — 500. Они соответствовали активным флагам стенда. Неожиданных ошибок приложения не выявлено.

**Непроверенные действия вне критериев/запрещённые:** настоящий Telegram-провайдер не открывался — проверен только локальный `/__qa/provider`; подтверждение удаления аккаунта не выполнялось. Пропусков из-за лимита шагов нет.

**Артефакты** (`tmp/qa-83-82-94-96-final/`):
- Account: `account-desktop-final.png`, `account-mobile-final.png`, `account-dark-mobile.png`
- Documents: `documents-dirty-desktop.png`
- FAQ: `faq-demo-mobile.png`, `faq-dark-mobile.png`, `faq-long-desktop.png`, `faq-long-mobile.png`

QA_RESULT: PASS
