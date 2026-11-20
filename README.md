# Midix Gram

Самостоятельный онлайн-мессенджер в стиле Telegram. Не является официальным клиентом Telegram и не подключается к Telegram.

## Уже в проекте
- Адаптивный интерфейс Next.js для телефона и компьютера.
- Регистрация и вход по email через Supabase Auth.
- Публичные комнаты, личные диалоги и создание приватных групп.
- Поиск пользователей и запуск личного диалога.
- Сообщения и подписка на новые сообщения через Supabase Realtime.
- Каталог цифровых подарков (пока демонстрационный каталог, без оплаты и NFT-переводов).
- Отдельная веб-админка `/admin`, доступ только роли admin; в Android-приложении админ-раздел не показывается.
- Capacitor Android wrapper и GitHub Actions для сборки APK.

## Подключение Supabase (один раз)

1. Открой [Supabase Dashboard](https://supabase.com/dashboard), зарегистрируйся и нажми **New project**.
2. Назови проект `midix-gram`, выбери ближайший регион и придумай пароль базы данных. Сохрани пароль у себя.
3. Дождись запуска проекта.
4. В проекте открой **Connect** или **Settings → API Keys**. Скопируй:
   - **Project URL**;
   - **Publishable key** (начинается с `sb_publishable_`). Старый `anon` key тоже поддерживается.
5. Открой вкладку **SQL Editor → New query**, открой файл `supabase/schema.sql` в этом репозитории, скопируй весь текст, вставь в SQL Editor и нажми **Run**. Это создаст таблицы, правила доступа, публичные комнаты и RPC для личных чатов.
6. В Supabase открой **Authentication → Providers → Email** и оставь Email включённым. Для первых тестов можно отключить подтверждение email в **Authentication → Settings**; перед публичным запуском лучше включить его обратно.
7. Открой GitHub репозиторий → **Settings → Secrets and variables → Actions → New repository secret**. Добавь два секрета с точными именами:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Publishable key.
8. Открой GitHub → **Actions → Build Midix Gram Android APK → Run workflow**. После успешной сборки скачай artifact `Midix-Gram-Android-debug`. Для сайта те же две переменные нужно добавить в хостинг (например, Vercel) и сделать redeploy.

**Важно:** никогда не добавляй `sb_secret_`, `service_role`, пароль базы данных или другие секретные ключи в APK, браузер, GitHub исходники или переменные с префиксом `NEXT_PUBLIC_`. Для приложения нужен только publishable key; доступ к данным ограничивают политики RLS.

## Первый запуск и админ-права

1. Открой собранное приложение и зарегистрируй свой аккаунт.
2. В Supabase → **SQL Editor** выполни, заменив имя на свой username:
   ```sql
   update public.profiles set role='admin' where username='ТВОЙ_USERNAME';
   ```
3. Перезайди в веб-версию сайта. Админ-панель доступна только на сайте по адресу `/admin`.

## Локальная разработка

Требуется Node.js 20+:
```bash
npm install
cp .env.example .env.local
npm run dev
```
В `.env.local` укажи:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## Статус и ограничения

Текущая версия — развиваемая основа мессенджера. Реализованы аккаунты, комнаты, группы, поиск контактов, личные диалоги и обмен текстовыми сообщениями. Вложения, голосовые/видеозвонки, push-уведомления, полноценные настройки приватности, модерация, платежи и блокчейн-NFT ещё не реализованы. Подарки сейчас отображаются как каталог, не как реальные покупки.

APK из GitHub Actions — debug-сборка для тестирования, не подписанный релиз Google Play. Для публикации понадобится release keystore и AAB.
