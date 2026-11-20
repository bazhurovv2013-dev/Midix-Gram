-- Midix Gram database schema. Execute once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text not null default '',
  is_premium boolean not null default true,
  is_verified boolean not null default false,
  badge_label varchar(32),
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  is_group boolean not null default false,
  is_public boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(chat_id,user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists messages_chat_created_idx on public.messages(chat_id,created_at);
create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text not null default '🎁',
  description text not null default '',
  price_stars integer not null default 0 check(price_stars>=0),
  rarity text not null default 'common',
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.user_gifts (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  serial_number bigint generated always as identity
);

-- Upgrade an earlier Midix Gram prototype schema safely.
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists is_premium boolean not null default true;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists badge_label varchar(32);
alter table public.chats add column if not exists slug text;
alter table public.chats add column if not exists is_public boolean not null default false;
create unique index if not exists chats_slug_unique_idx on public.chats(slug);
alter table public.messages add column if not exists edited_at timestamptz;
insert into public.profiles(id,username,display_name)
select u.id,'user_' || substr(replace(u.id::text,'-',''),1,10),coalesce(u.raw_user_meta_data->>'display_name','')
from auth.users u
where not exists(select 1 from public.profiles p where p.id=u.id)
on conflict(id) do nothing;
drop policy if exists "Members can view chat membership" on public.chat_members;
drop policy if exists "Members can view messages" on public.messages;
drop policy if exists "Members can send messages" on public.messages;
alter table public.messages alter column sender_id drop not null;
alter table public.messages drop constraint if exists messages_sender_id_fkey;
alter table public.messages add constraint messages_sender_id_fkey foreign key(sender_id) references public.profiles(id) on delete set null;

create or replace function public.is_chat_member(target_chat uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.chat_members where chat_id=target_chat and user_id=auth.uid());
$$;
create or replace function public.is_midix_admin() returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
create or replace function public.handle_new_midix_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare base_name text;
begin
 base_name := coalesce(nullif(new.raw_user_meta_data->>'username',''),split_part(coalesce(new.email,'member'),'@',1));
 if exists(select 1 from public.profiles p where p.username=base_name and p.id<>new.id) then
   base_name := base_name || '_' || substr(replace(new.id::text,'-',''),1,6);
 end if;
 insert into public.profiles(id,username,display_name)
 values(new.id,base_name,coalesce(new.raw_user_meta_data->>'display_name',base_name))
 on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_midix_user_created on auth.users;
create trigger on_midix_user_created after insert on auth.users for each row execute procedure public.handle_new_midix_user();

alter table public.profiles enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.gifts enable row level security;
alter table public.user_gifts enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select to authenticated using(true);
drop policy if exists "profile self update" on public.profiles;
create policy "profile self update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles" on public.profiles for all to authenticated using(public.is_midix_admin()) with check(public.is_midix_admin());
drop policy if exists "chat members read chats" on public.chats;
create policy "chat members read chats" on public.chats for select to authenticated using(is_public or created_by=auth.uid() or public.is_chat_member(id));
drop policy if exists "users create chats" on public.chats;
create policy "users create chats" on public.chats for insert to authenticated with check(created_by=auth.uid() and is_public=false);
drop policy if exists "users join themselves" on public.chat_members;
create policy "users join themselves" on public.chat_members for insert to authenticated with check(user_id=auth.uid() and (exists(select 1 from public.chats c where c.id=chat_id and (c.is_public or c.created_by=auth.uid()))));
drop policy if exists "chat members read membership" on public.chat_members;
create policy "chat members read membership" on public.chat_members for select to authenticated using(public.is_chat_member(chat_id) or public.is_midix_admin());
drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages for select to authenticated using(public.is_chat_member(chat_id) or public.is_midix_admin());
drop policy if exists "members send messages" on public.messages;
create policy "members send messages" on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.is_chat_member(chat_id));
drop policy if exists "users read active gifts" on public.gifts;
create policy "users read active gifts" on public.gifts for select to authenticated using(active or public.is_midix_admin());
drop policy if exists "admins manage gifts" on public.gifts;
create policy "admins manage gifts" on public.gifts for all to authenticated using(public.is_midix_admin()) with check(public.is_midix_admin());
drop policy if exists "users read owned gifts" on public.user_gifts;
create policy "users read owned gifts" on public.user_gifts for select to authenticated using(owner_id=auth.uid() or public.is_midix_admin());


-- Create a private one-to-one conversation without exposing membership writes.
create or replace function public.create_direct_chat(target_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_chat uuid; target_name text;
begin
 if auth.uid() is null or target_user=auth.uid() then raise exception 'Invalid recipient'; end if;
 if not exists(select 1 from public.profiles where id=target_user) then raise exception 'User not found'; end if;
 select username into target_name from public.profiles where id=target_user;
 insert into public.chats(title,is_group,is_public,created_by)
 values(coalesce(target_name,'Личный чат'),false,false,auth.uid()) returning id into new_chat;
 insert into public.chat_members(chat_id,user_id) values(new_chat,auth.uid()),(new_chat,target_user);
 return new_chat;
end; $$;
revoke all on function public.create_direct_chat(uuid) from public;
grant execute on function public.create_direct_chat(uuid) to authenticated;

insert into public.chats(title,slug,is_group,is_public) values
('Общий чат','general',true,true),('Друзья','friends',true,true),('Новости Midix','news',true,true)
on conflict(slug) do nothing;
insert into public.gifts(title,emoji,price_stars,rarity) values
('Роза','🌹',15,'common'),('Мишка','🧸',50,'rare'),('Кристалл','💎',120,'epic'),('Корона','👑',500,'legendary'),('Ракета','🚀',250,'epic'),('Сюрприз','🎁',80,'rare')
on conflict do nothing;
revoke update on public.profiles from authenticated;
grant update(username,display_name,avatar_url,bio) on public.profiles to authenticated;
-- Create your first account, then grant admin in SQL:
-- update public.profiles set role='admin' where username='YOUR_USERNAME';
