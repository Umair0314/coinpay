-- Phase 2 admin RBAC, audit history, and server-side request processing.
create type public.admin_role as enum ('customer', 'super_admin', 'finance_admin', 'operations_admin', 'support_admin');
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name public.admin_role unique not null,
  created_at timestamptz not null default now()
);
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);
create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role_id uuid not null references public.roles(id),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.transaction_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  request_type public.request_type not null,
  from_status text,
  to_status text not null,
  actor_id uuid not null references auth.users(id),
  note text,
  created_at timestamptz not null default now()
);
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  request_type public.request_type not null,
  author_id uuid not null references auth.users(id),
  note text not null check (length(note) between 1 and 2000),
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index transaction_status_history_request_idx on public.transaction_status_history(request_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

insert into public.roles (name) values
  ('customer'), ('super_admin'), ('finance_admin'), ('operations_admin'), ('support_admin')
on conflict (name) do nothing;
insert into public.permissions (name) values
  ('users.read'), ('users.manage'), ('deposits.read'), ('deposits.verify'), ('deposits.complete'),
  ('withdrawals.read'), ('withdrawals.approve'), ('withdrawals.complete'), ('rates.read'), ('rates.manage'),
  ('games.manage'), ('payment_methods.manage'), ('staff.manage'), ('reports.read'), ('audit_logs.read'), ('settings.manage')
on conflict (name) do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p where r.name = 'super_admin'
on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.name in
('users.read','deposits.read','deposits.verify','withdrawals.read','withdrawals.approve','withdrawals.complete','reports.read')
where r.name = 'finance_admin' on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.name in
('users.read','deposits.read','deposits.complete','withdrawals.read','withdrawals.approve','withdrawals.complete','games.manage')
where r.name = 'operations_admin' on conflict do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r join public.permissions p on p.name in
('users.read','deposits.read','withdrawals.read') where r.name = 'support_admin' on conflict do nothing;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.transaction_status_history enable row level security;
alter table public.admin_notes enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin_user(target_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = target_user and r.name <> 'customer');
$$;
create or replace function public.has_admin_permission(requested_permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid() and p.name = requested_permission
  );
$$;
grant execute on function public.is_admin_user(uuid) to authenticated;
grant execute on function public.has_admin_permission(text) to authenticated;

create policy "admins read roles" on public.roles for select to authenticated using (public.is_admin_user());
create policy "admins read permissions" on public.permissions for select to authenticated using (public.is_admin_user());
create policy "admins read user roles" on public.user_roles for select to authenticated using (public.is_admin_user());
create policy "admins read histories" on public.transaction_status_history for select to authenticated using (public.is_admin_user());
create policy "admins read notes" on public.admin_notes for select to authenticated using (public.is_admin_user());
create policy "admins read audit logs" on public.audit_logs for select to authenticated using (public.has_admin_permission('audit_logs.read'));
create policy "admins write audit logs" on public.audit_logs for insert to authenticated with check (public.is_admin_user());
create policy "admins read settings" on public.system_settings for select to authenticated using (public.has_admin_permission('settings.manage'));

create policy "admins read customers" on public.profiles for select to authenticated using (public.has_admin_permission('users.read'));
create policy "admins read games" on public.games for select to authenticated using (public.has_admin_permission('games.manage') or public.has_admin_permission('deposits.read'));
create policy "admins manage games" on public.games for all to authenticated using (public.has_admin_permission('games.manage')) with check (public.has_admin_permission('games.manage'));
create policy "admins read rates" on public.exchange_rates for select to authenticated using (public.has_admin_permission('rates.read') or public.has_admin_permission('games.manage'));
create policy "admins manage rates" on public.exchange_rates for all to authenticated using (public.has_admin_permission('rates.manage')) with check (public.has_admin_permission('rates.manage'));
create policy "admins read destinations" on public.payment_destinations for select to authenticated using (public.has_admin_permission('payment_methods.manage'));
create policy "admins manage destinations" on public.payment_destinations for all to authenticated using (public.has_admin_permission('payment_methods.manage'));
create policy "admins read deposits" on public.deposit_requests for select to authenticated using (public.has_admin_permission('deposits.read'));
create policy "admins read withdrawals" on public.withdrawal_requests for select to authenticated using (public.has_admin_permission('withdrawals.read'));

create or replace function public.admin_update_request_status(
  request_id uuid, request_kind public.request_type, next_status text, status_note text default null,
  processing_ref text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare current_status text; old_row jsonb; new_row jsonb; required_permission text;
begin
  required_permission := case when request_kind = 'deposit' then 'deposits.verify' else 'withdrawals.approve' end;
  if not public.has_admin_permission(required_permission) then raise exception 'permission_denied'; end if;
  if request_kind = 'deposit' then
    select to_jsonb(d), d.status::text into old_row, current_status from public.deposit_requests d where d.id = request_id for update;
    if current_status is null then raise exception 'request_not_found'; end if;
    if next_status = 'completed' and not public.has_admin_permission('deposits.complete') then raise exception 'permission_denied'; end if;
    if next_status not in ('under_review','payment_verified','processing','completed','rejected','cancelled') then raise exception 'invalid_status'; end if;
    if not (
      (current_status = 'pending' and next_status in ('under_review', 'rejected', 'cancelled')) or
      (current_status = 'under_review' and next_status in ('payment_verified', 'rejected')) or
      (current_status = 'payment_verified' and next_status in ('processing', 'rejected')) or
      (current_status = 'processing' and next_status in ('completed', 'rejected'))
    ) then raise exception 'invalid_status_transition'; end if;
    if next_status = 'completed' and coalesce(nullif(trim(processing_ref), ''), nullif(trim(status_note), '')) is null then raise exception 'completion_reference_required'; end if;
    if next_status = 'rejected' and nullif(trim(status_note), '') is null then raise exception 'rejection_reason_required'; end if;
    update public.deposit_requests set status = next_status::public.request_status, updated_at = now() where id = request_id returning to_jsonb(deposit_requests) into new_row;
  else
    select to_jsonb(w), w.status::text into old_row, current_status from public.withdrawal_requests w where w.id = request_id for update;
    if current_status is null then raise exception 'request_not_found'; end if;
    if next_status = 'completed' and not public.has_admin_permission('withdrawals.complete') then raise exception 'permission_denied'; end if;
    if next_status not in ('under_review','processing','completed','rejected','cancelled') then raise exception 'invalid_status'; end if;
    if not (
      (current_status = 'pending' and next_status in ('under_review', 'rejected', 'cancelled')) or
      (current_status = 'under_review' and next_status in ('processing', 'rejected')) or
      (current_status = 'processing' and next_status in ('completed', 'rejected'))
    ) then raise exception 'invalid_status_transition'; end if;
    if next_status = 'completed' and coalesce(nullif(trim(processing_ref), ''), nullif(trim(status_note), '')) is null then raise exception 'completion_reference_required'; end if;
    if next_status = 'rejected' and nullif(trim(status_note), '') is null then raise exception 'rejection_reason_required'; end if;
    update public.withdrawal_requests set status = next_status::public.request_status, updated_at = now() where id = request_id returning to_jsonb(withdrawal_requests) into new_row;
  end if;
  insert into public.transaction_status_history(request_id, request_type, from_status, to_status, actor_id, note)
    values (request_id, request_kind, current_status, next_status, auth.uid(), status_note);
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, before_data, after_data)
    values (auth.uid(), 'status_changed', request_kind::text, request_id, old_row, new_row);
  return new_row;
end;
$$;
grant execute on function public.admin_update_request_status(uuid, public.request_type, text, text, text) to authenticated;

-- After creating the Supabase Auth user, assign the supplied launch administrator
-- from the SQL editor; never store the password in migrations:
-- insert into public.user_roles(user_id, role_id)
-- select id, (select id from public.roles where name = 'super_admin')
-- from auth.users where email = 'admin@example.com'
-- on conflict (user_id) do update set role_id = excluded.role_id;
