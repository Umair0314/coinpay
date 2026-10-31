alter table public.deposit_requests
  alter column transaction_id drop not null;

-- Development-only payment destinations. Replace or disable these in the admin dashboard.
insert into public.payment_destinations (method, account_number, account_title, enabled, sort_order)
select 'JazzCash', '0300-0000000', 'CoinPay Demo JazzCash', true, 10
where not exists (
  select 1 from public.payment_destinations where method = 'JazzCash' and account_number = '0300-0000000'
);

insert into public.payment_destinations (method, account_number, account_title, enabled, sort_order)
select 'EasyPaisa', '0300-0000000', 'CoinPay Demo EasyPaisa', true, 20
where not exists (
  select 1 from public.payment_destinations where method = 'EasyPaisa' and account_number = '0300-0000000'
);
