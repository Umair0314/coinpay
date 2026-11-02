-- Add the enum value in its own migration transaction.
alter type public.admin_role add value if not exists 'transaction_processor';
