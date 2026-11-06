-- SoulBox November 2026: Gift Flow (Build Brief Part A7, Logic & Data Spec 7.3 / 7.4)
-- Run once in the Supabase SQL editor (or via the management API).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ── Gifts: one row per Gift Flow, created when the user taps "I'm in the UK" ──
create table if not exists public.gifts (
  gift_id              uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  session_id           text,                 -- browser session id (links gift_started, which fires before the row exists)
  source_ref           text,                 -- ?ref= from the visitor's very first page
  ab_variant           text check (ab_variant in ('A','B')),

  -- Screen 1
  gifter_name          text,
  recipient_name       text,
  -- Screens 2–3
  relationship         text check (relationship in ('Lover','Best Friend','Parent','Sibling','Child','Colleague')),
  occasion             text check (occasion in ('Birthday','Christmas','Valentine''s','A Hard Chapter','New Chapter','Thank You','Just Because')),
  -- Screen 4: Loved it / Maybe / Not them
  mood_harrypotter       text check (mood_harrypotter       in ('Loved it','Maybe','Not them')),
  mood_gameofthrones     text check (mood_gameofthrones     in ('Loved it','Maybe','Not them')),
  mood_prideprejudice    text check (mood_prideprejudice    in ('Loved it','Maybe','Not them')),
  mood_sherlock          text check (mood_sherlock          in ('Loved it','Maybe','Not them')),
  mood_gonegirl          text check (mood_gonegirl          in ('Loved it','Maybe','Not them')),
  mood_shining           text check (mood_shining           in ('Loved it','Maybe','Not them')),
  mood_hungergames       text check (mood_hungergames       in ('Loved it','Maybe','Not them')),
  mood_jurassicpark      text check (mood_jurassicpark      in ('Loved it','Maybe','Not them')),
  mood_hitchhikers       text check (mood_hitchhikers       in ('Loved it','Maybe','Not them')),
  mood_gatsby            text check (mood_gatsby            in ('Loved it','Maybe','Not them')),
  mood_ove               text check (mood_ove               in ('Loved it','Maybe','Not them')),
  mood_acotar            text check (mood_acotar            in ('Loved it','Maybe','Not them')),
  -- Screens 5–9
  loved_book           text,
  hard_nos             text[] not null default '{}',
  life_chapter         text check (life_chapter in ('Running on empty','Starting something new','Thriving','Craving excitement','Steady as ever')),
  specific_details     text,
  what_they_mean       text,
  -- Screen 10
  memory_cards         text check (memory_cards in ('Yes','No')),
  memory_place         text,
  memory_joke          text,
  memory_tribute       text,
  -- Screen 11
  reading_fuel         text check (reading_fuel in ('Shortbread','Dark Chocolate','Candy Kittens','Fudge')),

  last_screen_reached  text,

  -- Payment (Stripe)
  payment_status       text not null default 'not paid' check (payment_status in ('not paid','paid')),
  stripe_session_id    text,
  stripe_order_id      text,                 -- Stripe PaymentIntent id
  paid_at              timestamptz,
  gifter_email         text,                 -- collected by Stripe Checkout
  shipping_name        text,
  shipping_phone       text,
  shipping_address     jsonb,

  sheet_synced_at      timestamptz           -- last successful mirror to the Google Sheet "Gifts" tab
);

create index if not exists gifts_created_at_idx on public.gifts (created_at desc);
create index if not exists gifts_source_ref_idx on public.gifts (source_ref);
create index if not exists gifts_payment_status_idx on public.gifts (payment_status);
create unique index if not exists gifts_stripe_session_idx on public.gifts (stripe_session_id) where stripe_session_id is not null;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists gifts_touch_updated_at on public.gifts;
create trigger gifts_touch_updated_at before update on public.gifts
  for each row execute function public.touch_updated_at();

-- ── Events: server-side copy of tracking events (PostHog is the main analytics tool) ──
create table if not exists public.events (
  event_id        uuid primary key default gen_random_uuid(),
  reader_id       text,
  gift_id         uuid references public.gifts (gift_id) on delete set null,
  session_id      text,
  event_type      text not null check (event_type in ('screen_view','screen_complete','milestone')),
  screen_name     text,
  milestone_name  text,
  "timestamp"     timestamptz not null default now(),
  source_ref      text,
  ab_variant      text,
  reading_type    text check (reading_type in ('quick','full','gift'))
);

create index if not exists events_gift_id_idx on public.events (gift_id);
create index if not exists events_timestamp_idx on public.events ("timestamp" desc);
create index if not exists events_milestone_idx on public.events (milestone_name) where milestone_name is not null;

-- Lock both tables down: only the backend (secret / service_role key) may read or write.
alter table public.gifts  enable row level security;
alter table public.events enable row level security;
revoke all on public.gifts  from anon, authenticated;
revoke all on public.events from anon, authenticated;
