create extension if not exists "pgcrypto";

create type public.request_type as enum ('deposit', 'withdrawal');
create type public.request_status as enum ('pending', 'under_review', 'payment_verified', 'processing', 'completed', 'rejected', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.games (
  id uuid primary key default gen_random_uuid(), name text not null, player_id_label text not null default 'Game ID or Player ID',
  enabled boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payment_destinations (
  id uuid primary key default gen_random_uuid(), method text not null, account_number text not null, account_title text not null,
  enabled boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(), game_id uuid not null references public.games(id), purchase_coins_per_pkr numeric(14,4),
  withdrawal_pkr_per_coin numeric(14,4), min_amount_pkr numeric(14,2) not null default 1, max_amount_pkr numeric(14,2),
  effective_from timestamptz not null default now(), effective_to timestamptz, created_at timestamptz not null default now()
);
create table public.deposit_requests (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), game_id uuid not null references public.games(id),
  game_name_snapshot text not null, player_id text not null, requested_amount numeric(14,2) not null check (requested_amount > 0),
  currency text not null default 'PKR', rate_used numeric(14,4) not null, calculated_coins numeric(14,2) not null,
  payment_destination_id uuid not null references public.payment_destinations(id), transaction_id text not null,
  whatsapp_number text, status public.request_status not null default 'pending', idempotency_key uuid not null unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index deposit_requests_customer_destination_tid on public.deposit_requests(customer_id, payment_destination_id, transaction_id);
create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id), game_id uuid not null references public.games(id),
  game_name_snapshot text not null, player_id text not null, requested_amount numeric(14,2) not null check (requested_amount > 0),
  currency text not null default 'PKR', rate_used numeric(14,4) not null, calculated_payout numeric(14,2) not null,
  payout_method text not null, account_number text not null, account_title text not null, whatsapp_number text,
  status public.request_status not null default 'pending', idempotency_key uuid not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), created_at timestamptz not null default now(), resolved_at timestamptz
);
create table public.transaction_attachments (
  id uuid primary key default gen_random_uuid(), request_id uuid not null, request_type public.request_type not null,
  customer_id uuid not null references auth.users(id), storage_path text not null, mime_type text not null,
  attachment_deleted_at timestamptz, created_at timestamptz not null default now()
);
create table public.system_settings (
  key text primary key, value text not null, updated_at timestamptz not null default now()
);
insert into public.system_settings (key, value) values
  ('withdrawals_enabled', 'true'),
  ('whatsapp_channel_url', ''),
  ('support_whatsapp_number', ''),
  ('proof_max_size_bytes', '5242880');
alter table public.system_settings enable row level security;
create policy "customers read public settings" on public.system_settings for select using (key in ('withdrawals_enabled', 'whatsapp_channel_url', 'support_whatsapp_number', 'proof_max_size_bytes'));
create view public.customer_requests as
select id, customer_id, 'deposit'::text as type, status::text, requested_amount, game_name_snapshot, player_id, calculated_coins, created_at from public.deposit_requests
union all
select id, customer_id, 'withdrawal'::text, status::text, requested_amount, game_name_snapshot, player_id, calculated_payout, created_at from public.withdrawal_requests;
alter view public.customer_requests set (security_invoker = true);

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.payment_destinations enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.deposit_requests enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.transaction_attachments enable row level security;
create policy "users read own profile" on public.profiles for select using (id = auth.uid());
create policy "customers read enabled games" on public.games for select using (enabled = true);
create policy "customers read enabled destinations" on public.payment_destinations for select using (enabled = true);
create policy "customers read active rates" on public.exchange_rates for select using (effective_from <= now() and (effective_to is null or effective_to > now()));
create policy "customers read own deposits" on public.deposit_requests for select using (customer_id = auth.uid());
create policy "customers read own withdrawals" on public.withdrawal_requests for select using (customer_id = auth.uid());
create policy "users create own deletion request" on public.account_deletion_requests for insert with check (user_id = auth.uid());
create policy "users read own attachments" on public.transaction_attachments for select using (customer_id = auth.uid());
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', false) on conflict (id) do nothing;
create policy "customers upload own proof" on storage.objects for insert to authenticated with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "customers read own proof" on storage.objects for select to authenticated using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
revoke all on public.customer_requests from anon;
grant select on public.customer_requests to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', '')); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
