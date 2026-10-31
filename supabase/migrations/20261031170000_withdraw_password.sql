alter table public.withdrawal_requests
  add column withdraw_password_hash text not null default '';

alter table public.withdrawal_requests
  alter column withdraw_password_hash drop default;
