-- CoinPay Supabase queries used on 2026-10-31
-- This file is a reference. Review each query before running it.

-- ============================================================
-- 1. Delete all development users and related transaction data
-- ============================================================
-- Purpose: completely reset development/test user data.
-- WARNING: destructive and irreversible. Do not run in production.
begin;

delete from public.transaction_attachments;
delete from public.account_deletion_requests;
delete from public.deposit_requests;
delete from public.withdrawal_requests;
delete from auth.users;

commit;

-- ============================================================
-- 2. Add development payment destinations
-- ============================================================
-- Purpose: show JazzCash and EasyPaisa options on the deposit page.
-- Replace these demo details with real admin-managed details before launch.
insert into public.payment_destinations
  (method, account_number, account_title, enabled, sort_order)
values
  ('JazzCash', '0300-0000000', 'CoinPay Demo JazzCash', true, 10),
  ('EasyPaisa', '0300-0000000', 'CoinPay Demo EasyPaisa', true, 20);

-- ============================================================
-- 3. Check a user's Supabase Auth verification state
-- ============================================================
-- Purpose: confirm whether Supabase Auth considers an email verified.
select
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  confirmation_sent_at,
  last_sign_in_at,
  created_at
from auth.users
where email = 'your-email@example.com';

-- ============================================================
-- 4. Check a user's profile verification state
-- ============================================================
-- Purpose: inspect the application profile and its verification flag.
select
  id,
  full_name,
  phone,
  created_at,
  updated_at,
  is_verified
from public.profiles
where id = 'your-user-id';

-- ============================================================
-- 5. Reset a profile verification flag for an unconfirmed user
-- ============================================================
-- Purpose: correct test data only when Auth has not confirmed the email.
-- This does not verify or unverify Supabase Auth; auth.users is authoritative.
update public.profiles p
set is_verified = false,
    updated_at = now()
from auth.users u
where p.id = u.id
  and u.email = 'your-email@example.com'
  and u.email_confirmed_at is null
  and u.confirmed_at is null;

-- ============================================================
-- 6. Check all development payment destinations
-- ============================================================
-- Purpose: verify that JazzCash and EasyPaisa are enabled and visible.
select
  id,
  method,
  account_number,
  account_title,
  enabled,
  sort_order
from public.payment_destinations
where method in ('JazzCash', 'EasyPaisa')
order by sort_order;
