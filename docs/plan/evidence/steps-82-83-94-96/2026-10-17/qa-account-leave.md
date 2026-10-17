## QA-отчёт: E1 — Save → пересоздание формы → Sign out

**K1 — PASS.** На `/settings` сбросил стенд и дождался `Public profile`. Через UI изменил `Bio` на `Saved before sign out final verification`, перешёл по ссылке `Account` и нажал `Sign out`. До подтверждения диалог `Save your changes?` виден; состояние стенда: `owner=true`, `profile.bio="A fictional psychologist for acceptance checks."`; запросов `PATCH /api/profile` и `POST /api/auth/sign-out` нет.

**K2 — PASS.** Нажал `Save and continue`, дождался точного условия `location.pathname === '/'`, затем `Sign in` на главной. После перехода: `owner=false`, `profile.bio="Saved before sign out final verification"`, ровно один `PATCH /api/profile`, затем один `POST /api/auth/sign-out`; pathname `/`, диалога нет. Скриншот главной визуально проверен. Ошибок страницы и сообщений консоли не обнаружено.

**Артефакт:** `tmp/qa-83-82-94-96-verify/k2-home.png`  
**Непроверенные критерии:** отсутствуют.

QA_RESULT: PASS
