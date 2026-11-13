-- How your mind works: five questions after the darkness slider (saved only; no effect on results).
alter table public.readers
  add column if not exists depth_colour text,
  add column if not exists depth_dream  text,
  add column if not exists depth_city   text,
  add column if not exists depth_sleep  text,
  add column if not exists depth_voice  text;
