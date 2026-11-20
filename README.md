# Midix Gram

Самостоятельный мессенджер в стиле Telegram. Это не официальный клиент Telegram и не подключение к серверам Telegram.

## Что реализовано в основе
- Адаптивный Next.js интерфейс для компьютера и Android.
- Регистрация и вход через Supabase Auth.
- Схема профилей, комнат, участников, сообщений и подарков.
- Загрузка сообщений из Supabase и подписка на новые сообщения через Realtime.
- Веб-админка по адресу `/admin`, доступная только аккаунтам с ролью `admin`; в Android-клиенте раздел не показывается.
- Capacitor-конфигурация и GitHub Actions workflow для тестовой Android APK.

## Настройка онлайн-сервера
1. Создай проект в Supabase.
2. В Settings → API скопируй Project URL и anon/publishable key.
3. В GitHub → Settings → Secrets and variables → Actions добавь:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Выполни `supabase/schema.sql` в Supabase SQL Editor.
5. В Authentication включи Email provider.
6. Создай аккаунт в Midix Gram. Чтобы выдать себе админ-доступ, выполни SQL:
   `update public.profiles set role='admin' where username='ТВОЙ_USERNAME';`

Никогда не помещай `service_role` key в браузер или APK. Роль администратора изменяй только через SQL/защищённый сервер.

## Локальный запуск
Требуется Node.js 20+:
```bash
npm install
cp .env.example .env.local
npm run dev
```
Заполни переменные Supabase в `.env.local`.

## Получить APK
Открой GitHub → Actions → **Build Midix Gram Android APK** → **Run workflow**. После успешного запуска скачай Artifact `Midix-Gram-Android-debug`.

Это debug APK для тестирования, не подписанный релиз Google Play. Для публикации потребуется release keystore и AAB. Если Supabase secrets не добавлены, APK соберётся, но онлайн-авторизация и синхронизация не заработают.
