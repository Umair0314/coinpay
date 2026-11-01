-- The customer form currently treats transaction_id as optional.
alter table public.deposit_requests
  alter column transaction_id drop not null;

-- Keep the customer/admin history integration safe to apply after a partial deploy.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid,
  request_type public.request_type,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
