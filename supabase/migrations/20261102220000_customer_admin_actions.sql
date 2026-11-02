alter table public.profiles
  add column if not exists blocked_at timestamptz;
