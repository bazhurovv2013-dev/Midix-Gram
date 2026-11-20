# Midix Gram

A Telegram-inspired independent messenger starter with a responsive dark UI, demo chats, gift catalog, and a Supabase database foundation.

## Current status

This is a **front-end prototype**, not a production messenger:
- Responsive messenger interface with sample chats
- Demo message composer (messages are held in browser memory only)
- Gift catalog mockup
- Supabase schema starter for profiles, chats, memberships, messages, gifts, and owned gifts

Authentication, realtime messaging, uploads, push notifications, payments, NFT minting/transfers, and the secure web-only admin console are not implemented yet.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Supabase

1. Create a Supabase project.
2. Add the project URL and anon key to `.env.local`.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Review and test every RLS policy before using real accounts or data.

## Admin console

The planned admin console is web-only. Do not expose admin controls in the Android client. Admin authorization must be checked server-side on every privileged operation; hiding a button or route is not security.

## Android

An Android app can later be built with Capacitor or a native shell. No APK has been built yet.
