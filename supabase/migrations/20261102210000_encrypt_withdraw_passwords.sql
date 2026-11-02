-- Store the separate game withdrawal password encrypted for authorized processing.
alter table public.withdrawal_requests
  add column if not exists withdraw_password_encrypted text;
