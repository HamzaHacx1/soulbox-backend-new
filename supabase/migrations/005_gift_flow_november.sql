-- Gift Flow, November client changes: £59, reveal, bookworm, Kettle Chips, compulsory memory cards.
alter table public.gifts
  add column if not exists reveal   text check (reveal in ('Yes','Mystery')),
  add column if not exists bookworm text check (bookworm in ('Reading is who they are','They read regularly','Now and again','They’re just getting into it'));

-- Kettle Chips joins the treats.
alter table public.gifts drop constraint if exists gifts_reading_fuel_check;
alter table public.gifts add constraint gifts_reading_fuel_check
  check (reading_fuel in ('Kettle Chips','Shortbread','Fudge','Dark Chocolate','Candy Kittens'));
