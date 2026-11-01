-- Connect customer request creation, admin processing, and customer updates.
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
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "admins read notifications" on public.notifications;
create policy "admins read notifications" on public.notifications for select to authenticated using (public.is_admin_user());

-- Repair permission rows when the RBAC migration was applied in stages.
insert into public.permissions (name)
values
  ('users.read'), ('users.manage'), ('deposits.read'), ('deposits.verify'), ('deposits.complete'),
  ('withdrawals.read'), ('withdrawals.approve'), ('withdrawals.complete'), ('rates.read'), ('rates.manage'),
  ('games.manage'), ('payment_methods.manage'), ('staff.manage'), ('reports.read'), ('audit_logs.read'), ('settings.manage')
on conflict (name) do nothing;
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.name = 'super_admin'
on conflict do nothing;

-- Customers can see their own status timeline; admins can see all timelines.
drop policy if exists "customers read own histories" on public.transaction_status_history;
create policy "customers read own histories" on public.transaction_status_history for select to authenticated using (
  exists (
    select 1 from public.deposit_requests d
    where request_type = 'deposit' and d.id = request_id and d.customer_id = auth.uid()
  )
  or exists (
    select 1 from public.withdrawal_requests w
    where request_type = 'withdrawal' and w.id = request_id and w.customer_id = auth.uid()
  )
);

-- Admins can read private proof metadata and create short-lived signed URLs server-side.
drop policy if exists "admins read attachments" on public.transaction_attachments;
create policy "admins read attachments" on public.transaction_attachments for select to authenticated using (
  public.has_admin_permission('deposits.read')
  or public.has_admin_permission('withdrawals.read')
);
drop policy if exists "admins read proof files" on storage.objects;
create policy "admins read proof files" on storage.objects for select to authenticated using (
  bucket_id = 'payment-proofs' and (
    public.has_admin_permission('deposits.read')
    or public.has_admin_permission('withdrawals.read')
  )
);

create or replace function public.notify_request_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare customer uuid;
begin
  if new.request_type = 'deposit' then
    select customer_id into customer from public.deposit_requests where id = new.request_id;
  else
    select customer_id into customer from public.withdrawal_requests where id = new.request_id;
  end if;
  if customer is not null then
    insert into public.notifications(user_id, request_id, request_type, title, message)
    values (
      customer, new.request_id, new.request_type,
      initcap(new.request_type::text) || ' request updated',
      'Your request status is now ' || replace(new.to_status, '_', ' ') || coalesce('. ' || new.note, '.')
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notify_request_status_change_trigger on public.transaction_status_history;
create trigger notify_request_status_change_trigger
after insert on public.transaction_status_history
for each row execute function public.notify_request_status_change();
