-- Configure Transaction Processor after the enum value has been committed.
insert into public.roles (name)
values ('transaction_processor')
on conflict (name) do nothing;

delete from public.role_permissions
where role_id = (select id from public.roles where name = 'transaction_processor');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.name in (
  'deposits.read',
  'deposits.verify',
  'deposits.complete',
  'withdrawals.read',
  'withdrawals.approve',
  'withdrawals.complete'
)
where r.name = 'transaction_processor'
on conflict do nothing;
