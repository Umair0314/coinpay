-- Reporting events and a restricted request-processing staff role.
create table if not exists public.admin_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_login_events enable row level security;
create policy "super admins read login events" on public.admin_login_events
  for select to authenticated using (public.has_admin_permission('reports.read'));
