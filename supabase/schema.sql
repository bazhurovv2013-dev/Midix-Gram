-- Midix Gram starter schema. Run in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text not null default '🎁',
  description text,
  price_stars integer not null default 0 check (price_stars >= 0),
  rarity text not null default 'common',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_gifts (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id),
  owner_id uuid not null references auth.users(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  serial_number bigint
);

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.gifts enable row level security;
alter table public.user_gifts enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Authenticated users can view active gifts" on public.gifts for select to authenticated using (active = true);
create policy "Users can view own gifts" on public.user_gifts for select using (auth.uid() = owner_id);
create policy "Members can view chat membership" on public.chat_members for select using (
  exists (select 1 from public.chat_members m where m.chat_id = chat_members.chat_id and m.user_id = auth.uid())
);
create policy "Members can view messages" on public.messages for select using (
  exists (select 1 from public.chat_members m where m.chat_id = messages.chat_id and m.user_id = auth.uid())
);
create policy "Members can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.chat_members m where m.chat_id = messages.chat_id and m.user_id = auth.uid()
  )
);

-- Admin access is intentionally not granted by a client-side role flag.
-- Add a server-verified admin role / policy before enabling production admin actions.