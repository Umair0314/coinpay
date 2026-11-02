# CoinPay Phase 2 summary

Phase 2 adds a separate Next.js admin dashboard at `apps/web-admin`.

## Delivered

- Admin email/password login through Supabase Auth.
- TOTP MFA gate before any protected page.
- Server-side RBAC with Super Admin, Finance Admin, Operations Admin, and Support Admin roles.
- Permission checks on every protected page and mutation.
- Dashboard metrics for users, deposits, completed deposits, and withdrawals.
- Deposit and withdrawal queues with status processing.
- Database-enforced status transitions, completion references, rejection reasons, status history, and audit logs.
- Customer list.
- Game and rate creation.
- Payment destination creation.
- Staff role assignment.
- System setting updates.
- Reports and audit-log views.
- Shared customer/admin request integration with initial status history, customer notifications, admin request details, and signed payment-proof access.
- Responsive admin navigation and shared CoinPay styling.

## Database migration

Apply `supabase/migrations/20261101100000_phase2_admin.sql` after the Phase 1 migrations. It creates the RBAC tables, admin policies, history tables, audit logs, permission functions, and status-processing function.

Then apply `supabase/migrations/20261101220000_phase2_customer_admin_integration.sql`. This adds customer notifications, customer-readable status history, proof-file policies, and repairs Super Admin permission rows if the RBAC migration was applied in stages.

After changing the Supabase migrations, deploy both Edge Functions again:

```bash
supabase functions deploy create-deposit-request
supabase functions deploy create-withdrawal-request
```

After creating the administrator in Supabase Auth, assign the Super Admin role from the Supabase SQL editor:

```sql
insert into public.user_roles(user_id, role_id)
select id, (select id from public.roles where name = 'super_admin')
from auth.users
where email = 'your-admin-email@example.com'
on conflict (user_id) do update set role_id = excluded.role_id;
```

Then enroll and verify a TOTP factor for that account in Supabase Auth. Admin pages require `aal2`.

## Run and deploy

```bash
npm run admin:dev
npm run admin:typecheck
npm run admin:lint
npm run admin:build
```

Deploy `apps/web-admin` as its own Next.js project with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; required by the staff invitation route)
- `ADMIN_APP_URL` (for example, `https://coinpay-topaz.vercel.app`)

Add the admin deployment URL to Supabase Auth redirect and site URL settings as appropriate.
For staff invitations, add the admin callback URL
`https://<admin-domain>/auth/callback` to Supabase Authentication URL
Configuration → Redirect URLs. Invitations now redirect to the admin app,
where the invited user sets a password and then enrolls in MFA.

In Vercel, add these variables under the `web-admin` project for the Production
environment, then redeploy. Do not prefix `SUPABASE_SERVICE_ROLE_KEY` with
`NEXT_PUBLIC_` or put its value in the repository. Staff invitations show
`Server invite configuration missing` until both the URL and server key are
available to the deployed server.

## Security note

Admin passwords must not be stored in this repository or migration files. The password shared during setup should be rotated before production use because it was exposed in chat history.
