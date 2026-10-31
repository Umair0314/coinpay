# CoinPay Phase 1 Summary

## Status

Phase 1 customer website implementation is complete as a code foundation and passes lint, type-checking, and production build validation.

Production launch still requires Supabase deployment/configuration and real business data.

## Implemented

### Customer website

- Next.js App Router customer application in `apps/web-customer`
- Responsive, mobile-first CoinPay styling using the project brand tokens
- Welcome page with login and registration entry points
- Registration with email verification flow
- Login and logout
- Password reset request and password update page
- Protected customer routes with Supabase session handling
- Customer dashboard with:
  - Greeting
  - Deposit and withdrawal entry points
  - Recent requests
  - Empty request state
- Deposit request form with:
  - PKR amount
  - Admin-managed game selection
  - Game/player ID
  - Admin-managed payment destination selection
  - Transaction ID
  - Optional WhatsApp number
  - JPG, PNG, and WebP proof upload
- Withdrawal request form with:
  - PKR amount
  - Admin-managed game selection
  - Game/player ID
  - Payout method and account details
  - Optional WhatsApp number
- Request list and request detail pages
- Profile page
- Notifications placeholder
- Support page driven by database settings
- Account deletion request page
- Privacy and terms pages

### Backend foundation

- Supabase SSR and browser clients
- Session middleware
- Supabase migration for:
  - Profiles
  - Games
  - Payment destinations
  - Exchange rates
  - Deposit requests
  - Withdrawal requests
  - Transaction attachments
  - System settings
  - Account deletion requests
- Customer-facing RLS policies
- Private `payment-proofs` storage bucket
- Owner-scoped proof upload and read policies
- New-user profile creation trigger
- Shared customer request view

### Secure request creation

- Deposit and withdrawal creation runs through Supabase Edge Functions
- Rates and game data are read server-side
- Rate snapshots and calculated values are stored with each request
- Customer-supplied prices and statuses are not trusted
- Withdrawal creation checks `withdrawals_enabled`
- Deposit proof files are uploaded to owner-scoped paths
- Deposit transaction IDs are protected by a customer/destination uniqueness constraint
- Idempotency keys are included for request creation

## Validation completed

The following commands passed:

```text
npm run lint
npm run typecheck
npm run build
```

## Files and folders

- Customer app: `apps/web-customer`
- Shared types and validation: `packages/shared`
- Supabase migration: `supabase/migrations/20261031100000_phase1_customer.sql`
- Deposit Edge Function: `supabase/functions/create-deposit-request`
- Withdrawal Edge Function: `supabase/functions/create-withdrawal-request`
- Environment template: `.env.example`

## Remaining before production acceptance

1. Add real Supabase URL and anon key to deployment environment variables.
2. Apply the Supabase migration in the target project.
3. Deploy both Supabase Edge Functions.
4. Configure Supabase Auth email verification, password recovery, and production SMTP.
5. Populate games, exchange rates, payment destinations, and support settings through the admin dashboard.
6. Configure storage retention and scheduled proof cleanup.
7. Add comprehensive integration tests for RLS, request creation, rate snapshots, duplicate TIDs, and account isolation.
8. Complete Phase 2 admin dashboard to manage the customer-facing data and request processing.
9. Verify end-to-end flows with two separate customer accounts in the deployed Supabase project.

## Conclusion

The Phase 1 customer website codebase is implemented and build-valid. It is not yet production-ready until Supabase is configured, deployed, populated with admin-managed data, and tested end to end.
