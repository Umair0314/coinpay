alter table public.deposit_requests alter column customer_id drop not null;
alter table public.deposit_requests drop constraint deposit_requests_customer_id_fkey;
alter table public.deposit_requests add constraint deposit_requests_customer_id_fkey foreign key (customer_id) references auth.users(id) on delete set null;

alter table public.withdrawal_requests alter column customer_id drop not null;
alter table public.withdrawal_requests drop constraint withdrawal_requests_customer_id_fkey;
alter table public.withdrawal_requests add constraint withdrawal_requests_customer_id_fkey foreign key (customer_id) references auth.users(id) on delete set null;

alter table public.transaction_attachments alter column customer_id drop not null;
alter table public.transaction_attachments drop constraint transaction_attachments_customer_id_fkey;
alter table public.transaction_attachments add constraint transaction_attachments_customer_id_fkey foreign key (customer_id) references auth.users(id) on delete set null;

alter table public.account_deletion_requests alter column user_id drop not null;
alter table public.account_deletion_requests drop constraint account_deletion_requests_user_id_fkey;
alter table public.account_deletion_requests add constraint account_deletion_requests_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
