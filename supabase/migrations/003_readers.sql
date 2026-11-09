-- SoulBox November 2026: Readers table (Logic & Data Spec 7.2).
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Existing quiz questions keep their existing field names inside `answers`
-- (e.g. answers->'desire.tone'); every new or changed field has its own column.

create table if not exists public.readers (
  reader_id               uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  session_id              text,
  source_ref              text,
  ab_variant              text check (ab_variant in ('A','B')),
  reading_type            text check (reading_type in ('quick','full')),
  full_reading_link       text,
  full_reading_completed  text not null default 'no' check (full_reading_completed in ('yes','no')),
  last_screen_reached     text,

  -- Existing questions, under their existing field names
  answers                 jsonb not null default '{}'::jsonb,

  -- Part One
  genre_calling           text,
  genre_flavour           text,
  gate_1                  text,
  gate_2                  text,
  darkness                text,

  -- Part Two: Olympics (answer values, not option text)
  olympics_q1             text check (olympics_q1 in ('correct','decoy','optout')),
  olympics_q2             text check (olympics_q2 in ('correct','decoy','optout')),
  olympics_q3             text check (olympics_q3 in ('correct','decoy','optout')),
  olympics_q4             text check (olympics_q4 in ('correct','decoy','optout')),
  olympics_q5             text check (olympics_q5 in ('commercial','upmarket','literary')),

  -- Part Three: Masks
  masks_silver            smallint check (masks_silver between 1 and 3),
  masks_gold              smallint check (masks_gold between 1 and 3),
  masks_black             smallint check (masks_black between 1 and 3),

  -- Calculated results (saved after the Black)
  olympics_total          smallint,
  literary_grade          text,
  masks_total             smallint,
  moral_tier              text,
  moral_band              text,
  provisional_archetype   text,
  validation_changed      text,
  fallback_used           text,
  highbrow_override       text,
  final_archetype         text,
  house                   text,
  soul_character          text,

  -- Full Reading, Part One
  swipe_deck              text,
  swipe_01 text, swipe_02 text, swipe_03 text, swipe_04 text, swipe_05 text, swipe_06 text,
  swipe_07 text, swipe_08 text, swipe_09 text, swipe_10 text, swipe_11 text, swipe_12 text,
  triggers_other          text,

  -- Full Reading, Part Two
  eden_first_law          text,
  eden_shortage           text,
  eden_betrayal           text,
  final_mirror            text,
  final_ghost             text,
  final_rejection         text,

  -- House section and sales page
  results_saved           text,
  house_joined            text check (house_joined in ('yes','no')),
  first_name              text,
  email                   text,
  country                 text,
  country_detected        text,
  purchase                text,

  -- Filled in by hand by the curators in the Sheet
  curator_posture_primary   text,
  curator_posture_secondary text,
  curator_wound             text,
  curator_yearning          text,
  curator_notes             text,

  sheet_synced_at         timestamptz
);

create index if not exists readers_created_at_idx on public.readers (created_at desc);
create index if not exists readers_source_ref_idx on public.readers (source_ref);
create index if not exists readers_email_idx on public.readers (lower(email));

drop trigger if exists readers_touch_updated_at on public.readers;
create trigger readers_touch_updated_at before update on public.readers
  for each row execute function public.touch_updated_at();

alter table public.readers enable row level security;
revoke all on public.readers from anon, authenticated;
