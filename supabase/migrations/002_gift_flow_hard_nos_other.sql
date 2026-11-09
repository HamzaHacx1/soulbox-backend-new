-- Gift Flow revision (client feedback, 9 November 2026):
-- "Anything they'd hate?" gains a "Something else" tick box with a text box.
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.gifts add column if not exists hard_nos_other text;
