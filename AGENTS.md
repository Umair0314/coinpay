# CoinPay Project Instructions (Website Scope: Phase 1 and Phase 2)

Read this file fully before writing code. If a request conflicts with this file, stop and ask the project owner before changing anything.

This file covers only the two website phases: the customer website and the admin dashboard. The Android apps are later phases and are described in section 12 so the website and backend stay compatible with them. Do not build any Android code in this repo until the owner opens Phase 3.

## 1. Project Overview

CoinPay is a manual coin purchase (deposit) and withdrawal management system for users of third-party live-streaming and gaming apps. Migo Live is an example, not the only platform. Currency is PKR.

Customers register, pick a game, submit requests, upload payment proof, and track status. The CoinPay team verifies payments, adds or removes coins on the third-party platform, and sends withdrawal payments, all by hand.

**Hard rule:** no automatic payment or coin processing. A request is never `completed` until an authorized admin confirms the real-world action.

### Delivery phases

| Phase | Deliverable | Stack | Status |
|---|---|---|---|
| 1 | Customer Website | Next.js | In scope now |
| 2 | Admin Dashboard | Next.js | In scope now |
| 3 | Customer Android App | Flutter | Later, not in this repo task |
| 4 | Admin Android App | Flutter | Later, not in this repo task |

All phases use one shared Supabase backend. Phases 1 and 2 must not block or contradict Phases 3 and 4.

## 2. Technology Stack (confirmed)

| Layer | Choice |
|---|---|
| Web (Phases 1 and 2) | Next.js (App Router), TypeScript (strict), Tailwind CSS |
| Android (Phases 3 and 4) | Flutter, Dart, Material 3, Firebase Cloud Messaging |
| Backend | Supabase: PostgreSQL, Auth, RLS, Storage, Edge Functions, migrations |

Rules:
- One Supabase project is the only backend. No second database. No business logic duplicated in clients.
- Sensitive operations (create request with price snapshot, status changes, rate changes, role changes, signed proof URLs) run in Edge Functions or Postgres functions. Clients never write prices, rates, statuses, or roles.
- Customer website and admin dashboard are two separate Next.js apps with separate deployments and domains (for example `app.` and `admin.`), sharing a types package.
- Capacitor is not used. Android is Flutter only, in Phases 3 and 4.
- Do not change the stack without written approval.

## 3. Confirmed Decisions

- **Mandatory login.** No guest transactions.
- **Auth at launch:** email + password through Supabase Auth, with email verification and password reset. Phone OTP is deferred because SMS costs money per message; keep auth code method-agnostic so it can be added later. Collect phone as an unverified profile field.
- **Email delivery:** configure a custom SMTP provider before launch. Do not rely on Supabase's built-in email sender in production.
- **Admins:** invitation only, email + password, mandatory MFA (TOTP). No public admin sign-up.
- **No fixed game list.** Games, packages, rates, limits, and payment destinations are all admin-managed. Ship with empty tables and a clearly marked development seed.
- **Language:** English at launch, Urdu later. Build localization-ready from day one (section 11).
- **WhatsApp channel link and support number** live in `system_settings`, never in code.
- **Payment screenshots** are kept in a private bucket for a retention period (section 10).
- **Withdrawals** are part of the website scope because the client requested them, but they sit behind a setting `withdrawals_enabled` (default `true`). If the client later removes withdrawals, an admin turns the setting off and every withdrawal entry point disappears without a code change. Do not delete withdrawal code or tables.

## 4. UI and Brand Guidelines

The client's Android screens are the visual reference for the website too. Values below were measured from the client's JPEG screenshots (within a few units per channel). If the client supplies a theme or seed color, replace them once here and in the Tailwind config.

### 4.1 Color tokens

| Token | Hex | Use |
|---|---|---|
| `brand-900` | `#063C2D` | Splash and hero gradient bottom |
| `brand-700` | `#08664B` | Splash and hero gradient top |
| `logo-glyph` | `#086B4F` | Wallet icon on the white logo tile |
| `primary` | `#306A40` | Submit buttons, selected borders (`#306A42`), links |
| `bg` | `#F6FAF4` | Page background |
| `surface` | `#F2F4EE` | Form cards, input group cards, empty states |
| `hero-mint` | `#B2F2BE` | Welcome card with today's rate |
| `hero-text` | `#104C24` | Greeting line on the mint card |
| `deposit-tint` | `#E0F0DE` | Deposit tile |
| `deposit-accent` | `#4CAF50` | Deposit arrow |
| `withdraw-tint` | `#F8ECD4` | Withdraw tile |
| `withdraw-accent` | `#FF9800` | Withdraw arrow |
| `selected-tint` | `#E4EEE2` | Selected payment destination card |
| `whatsapp` | `#25D366` | WhatsApp and support buttons |
| `text` | `#141810` | Titles and body text |
| `text-strong` | `#081C0C` | Rate line and emphasis |
| `text-muted` | `#989C94` | Hints, placeholders, tile subtitles |
| `outline` | `#707870` | Input borders, outlined buttons |
| `on-dark` | `#FFFFFF` | Text and logo tile on green gradients |

Status colors (pick once, reuse everywhere): pending amber, under review blue, verified or processing teal, completed `#4CAF50`, rejected red, cancelled grey.

### 4.2 Style rules
- Material 3 look, Roboto (or Inter if the owner approves), rounded cards (about 16 px), inputs (about 12 px), pill-shaped primary buttons.
- Define colors once in the Tailwind theme as CSS variables. No hex values scattered in components.
- Layout is mobile-first. The customer site must look like the client's phone screens on a phone and scale up cleanly on desktop with a centered content column.
- Admin dashboard uses the same palette with a denser layout, data tables, and a left sidebar.
- Every screen has loading, empty, and error states. Home empty state text: "No requests yet. Tap Deposit or Withdraw to start."

### 4.3 Client-defined screens (customer)
1. **Welcome:** brand tile, tagline "Fast PKR deposits & withdrawals for your game coins.", Get Started, Join WhatsApp Channel, Contact on WhatsApp. Replace the client's "No account needed" line with login and registration wording.
2. **Home:** greeting with the user's name, today's rate (example: Rs 100 = 120 coins), Deposit and Withdraw tiles, recent requests with View all, support buttons.
3. **Deposit form:** 1) amount in PKR, 2) choose a payment destination (method, account number, title), 3) your details: Game ID or Player ID, game, Transaction ID (TID), optional WhatsApp number, 4) payment proof upload, then submit.
4. **Withdraw form:** Game ID or Player ID, game, amount in PKR; payout account type, account or mobile number, account title, optional WhatsApp number; helper text "Our team will confirm with game support, then send the payment to this account."; Submit Withdraw Request.

Improvements over the screens: game is a dropdown fed from the `games` table, not free text. The demo account on the deposit screen is placeholder data and must never be hardcoded.

## 5. Phase 1: Customer Website

### 5.1 Scope
Registration, login, logout, password reset, profile, dashboard, deposit request, withdrawal request (behind `withdrawals_enabled`), request list and detail, notifications, support links, account deletion request.

### 5.2 Routes (App Router)
- `/` welcome page
- `/register`, `/login`, `/forgot-password`, `/reset-password`
- `/dashboard`
- `/deposit/new`
- `/withdraw/new` (hidden and returns 404 when `withdrawals_enabled` is false)
- `/requests` list with filters (type, status), `/requests/[id]` detail
- `/profile`, `/notifications`, `/support`
- `/account/delete` (request deletion, with explanation of what is kept for accounting)
- `/privacy`, `/terms`

All routes except `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/privacy`, `/terms` require a session.

### 5.3 Deposit workflow
1. Customer logs in and opens Deposit.
2. Enters amount in PKR. If the selected game uses fixed packages, picks a package instead.
3. Sees the active purchase rate and the calculated coins, computed from the active rate (display only; the server recalculates).
4. Picks a payment destination from active `payment_destinations`, sends the money outside the site, then enters game, Game ID, TID, optional WhatsApp number.
5. Uploads the screenshot (JPG, PNG, or WebP; size limit in settings; validated by type and size on the server).
6. Submits. An Edge Function creates a `pending` request and stores the pricing snapshot (rate, package, limits, currency, calculated coins).
7. Customer sees the request in history. Admin processes it manually (Phase 2).

Statuses: `pending`, `under_review`, `payment_verified`, `processing`, `completed`, `rejected`, `cancelled`. Use `completed` only after the real top-up is confirmed. Customers may cancel only while `pending`.

### 5.4 Withdrawal workflow
1. Customer logs in and opens Withdraw (only when `withdrawals_enabled`).
2. Enters game, Game ID, amount in PKR. The server calculates the expected payout from the active withdrawal rate.
3. Picks payout account type (from active payout methods), enters account number, account title, optional WhatsApp number.
4. Submits. Edge Function creates a `pending` request with the pricing snapshot.
5. Admin verifies with game support, removes coins, sends the payment, records the payout reference (Phase 2).

Statuses: `pending`, `under_review`, `approved`, `processing`, `completed`, `rejected`, `cancelled`. Use `completed` only after both the coin deduction and the payout are confirmed.

### 5.5 Dashboard rules
- Show greeting, today's rate, Deposit and Withdraw tiles, recent requests, counts of pending, completed, and rejected.
- Do not show a coin balance. CoinPay has no balance ledger.
- Today's rate is read from the active rate record for the default or selected game.

### 5.6 Customer security
- Customers read only their own rows (RLS). Proof files are readable only by the owner and by admins with permission, through short-lived signed URLs.
- Rate-limit request creation per user. Block duplicate TIDs for the same destination and flag them.
- One in-flight submit per form, plus an idempotency key on create.

### 5.7 Phase 1 acceptance criteria
- A new user can register, verify email, log in, submit a deposit with proof, and see it in history.
- A new user can submit a withdrawal when the setting is on, and cannot reach it when it is off.
- A customer cannot read another customer's requests, proofs, or profile (tested with two accounts).
- Changing a rate in the database does not change an existing request's stored snapshot.
- All screens match section 4 and work from 360 px wide upward.
- No hardcoded games, rates, payment accounts, or support numbers anywhere in the code.

## 6. Phase 2: Admin Dashboard

### 6.1 Scope
Stats, customer management, deposit and withdrawal processing, game, package, and rate management, payment destination management, staff and permissions, reports, audit logs, settings.

### 6.2 Routes
- `/login` (email, password, then TOTP; admin routes require MFA assurance level `aal2`)
- `/dashboard` stats from real data
- `/deposits`, `/deposits/[id]`
- `/withdrawals`, `/withdrawals/[id]`
- `/customers`, `/customers/[id]`
- `/games`, `/games/[id]` (packages, rates, limits, instructions)
- `/payment-methods` (destinations and payout methods)
- `/staff` (invite, roles, permissions)
- `/reports`
- `/audit-logs`
- `/settings` (WhatsApp links, retention, upload limits, `withdrawals_enabled`)

### 6.3 Dashboard stats
Total users, total deposits, pending, completed, and rejected deposits, pending and completed withdrawals, total deposit amount, total withdrawal amount, recent activity. All from database queries. No demo values.

### 6.4 Deposit management
- List with search (customer, game, player ID, TID) and filters (date, status). Pagination.
- Detail view: customer, game, Game ID, amount, rate snapshot, calculated coins, TID, proof image (signed URL), history timeline.
- Actions, each gated by permission: mark under review, verify payment, mark processing, complete (requires processing reference or note and the acting admin), reject (requires a reason), add internal note.
- Show warnings: duplicate TID, TID or amount that differs from extracted proof data (if the optional extraction feature is built).
- Verification means the admin confirmed the money arrived in the CoinPay account. A screenshot alone is not proof of payment.

### 6.5 Withdrawal management
Same patterns as deposits: view payout account details (restricted by permission), approve or reject (reason required), record coin deduction, record payout reference or proof, confirm completion, internal notes.

### 6.6 Games, packages, rates
- Create, edit, enable, disable games, with instructions and required ID field labels.
- Create and edit packages. Set purchase rate and withdrawal rate separately, min and max limits, effective dates.
- Each rate change creates a new `exchange_rates` row. Never edit old rows.

### 6.7 Payment management
Add, edit, enable, and disable payment destinations (method, account number, account title) and payout methods. Real account details live only in the database.

### 6.8 Staff and permissions
Super Admin invites staff by email, assigns a role, and can adjust granular permissions. Invitation links are single-use and expire.

### 6.9 Roles and permissions (RBAC)
Roles: Customer, Super Admin, Finance Admin, Operations Admin, Support Admin.
- **Customer:** own profile, own requests, own proof uploads. Nothing else.
- **Super Admin:** everything, including staff, roles, settings, audit logs.
- **Finance Admin:** review proof, verify payments, process withdrawal payments, record references, financial reports.
- **Operations Admin:** review requests, record coin top-up or deduction, update processing info, internal notes.
- **Support Admin:** view customer info needed for support, view statuses, add support notes. No financial approval by default.

Granular permissions: `users.read`, `users.manage`, `deposits.read`, `deposits.verify`, `deposits.complete`, `withdrawals.read`, `withdrawals.approve`, `withdrawals.complete`, `rates.read`, `rates.manage`, `games.manage`, `payment_methods.manage`, `staff.manage`, `reports.read`, `audit_logs.read`, `settings.manage`.

Enforce every permission on the server. Hiding a button is not security. A customer can never approve their own transaction.

### 6.10 Phase 2 acceptance criteria
- An admin without MFA cannot reach any admin page.
- A Support Admin cannot verify or complete a request (server rejects it, tested).
- Each status change writes a history row, an audit log entry, and a customer notification.
- Invalid status jumps (for example `pending` to `completed`) are rejected by the server.
- Changing a rate, package, game, destination, or role writes an audit log with before and after values.
- Stats match a manual count of the database rows.

## 7. Database Design (Supabase PostgreSQL)

Create only what the requirements need. Proposed tables:
- Access: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `admin_invitations`
- Games and pricing: `games`, `game_fields` (only if per-game fields are needed), `coin_packages`, `exchange_rates`
- Transactions: `deposit_requests`, `withdrawal_requests`, `transaction_status_history`, `payment_methods`, `payment_destinations`, `transaction_attachments`
- Admin: `admin_notes`, `audit_logs`, `notifications`, `system_settings`
- Later phases: `device_tokens` (FCM tokens, created when Phase 3 starts)

Rules:
- UUID primary keys, foreign keys, indexes on searched fields, `created_at` and `updated_at` everywhere.
- Money as `numeric` or integer minor units. Never floats. Store the currency code (default PKR). Rates are stored as `numeric` (coins per 1 PKR for purchase; PKR per coin or per 1 coin unit for withdrawal, defined once in a migration comment).
- Every request stores a pricing snapshot: rate, package, limits, currency, calculated coins or payout.
- Preserve history. Status changes are written to `transaction_status_history`.
- Database constraints for status values, positive amounts, and allowed transitions.
- All schema changes through migrations. No manual production edits. Every table holding private data gets RLS policies in the same migration.

Request fields: customer ID, game ID, type, requested amount, currency, rate used, calculated coins or payout, payment method, status, external Game ID, game name snapshot, TID (deposits), payout account type, number, and title (withdrawals), optional WhatsApp number, submitted at, processed at, processing admin ID, processing reference, rejection reason, `attachment_deleted_at`.

Payout account numbers and titles are sensitive. Restrict them with RLS to users with withdrawal permissions.

## 8. Security Requirements

- **Auth:** Supabase Auth only. MFA required for all admin accounts. Secure password recovery.
- **RLS:** enabled on every table with private data. Customers read only their own profile, requests, and attachments.
- **Keys:** the Supabase service role key never appears in browser code. Keep secrets in server-side environment variables. Privileged operations run in Edge Functions or server-only code. Provide `.env.example` without real values.
- **Uploads:** validate type and size, private bucket, short-lived signed URLs, owner-scoped paths generated server-side, ignore client-supplied file paths.
- **Admin:** server-side permission checks, audit logging, re-authentication for sensitive actions (rate changes, role changes, destination changes), financial data limited by role.
- **Web hardening:** CSRF-safe cookie sessions, strict security headers, no secrets in client bundles, server-side input validation (for example with Zod) on every mutation, output escaping, and no user-controlled HTML.
- **Abuse limits:** rate-limit sign-up, login, password reset, and request creation.
- **Audit log:** record actor, action, affected record, timestamp, and before and after values for deposit verification and rejection, withdrawal approval and rejection, completion, rate, package, game, and destination changes, and staff or permission changes. Never log passwords, tokens, or full payment details.

## 9. Transaction Integrity and Manual Processing

- Customers submit requests and never approve them.
- Allowed transitions are enforced by one server function. Invalid jumps are rejected.
- Completion requires a processing reference or note and the acting admin ID.
- Every status change writes a history row and an audit log entry and creates a customer notification.
- Deposit `completed` means the coins are confirmed on the third-party platform. Withdrawal `completed` means both the coin deduction and the payout are confirmed.
- Wording across the site says "request", "under review", and "confirmed". Never imply automatic processing or guaranteed delivery times.

## 10. Payment Screenshot Retention

- **Proposed default (confirm with the client):** keep each screenshot for 12 months after its request reaches a final status (`completed`, `rejected`, `cancelled`), then delete the file. The request record, amounts, TID, and history stay. Set `attachment_deleted_at`.
- An admin with permission can place a dispute hold on a request, which blocks deletion until lifted.
- A scheduled job (Supabase scheduled Edge Function or `pg_cron`) runs daily, deletes expired files, and writes an audit entry per batch.
- The period lives in `system_settings`, so it changes without a code change.
- Account deletion requests: remove screenshots and personal fields that are not needed for financial records. Keep the minimum the client must retain for accounting.
- Optional later feature: extract TID, amount, and date from the screenshot server-side and show them next to the image as a check. Extraction never approves anything and the original image is kept for the retention period.

## 11. Localization and Support Links

- Launch language is English. Use `next-intl` (or equivalent) from the start: no hardcoded UI strings.
- Use logical CSS properties (`margin-inline-start`, `padding-inline-end`) so right-to-left Urdu works later without redesign. Plan an Urdu-capable font (for example Noto Nastaliq Urdu or Noto Sans Arabic).
- Store game and payment instructions in a structure that can hold per-locale text.
- Format amounts and dates with locale helpers, not string concatenation.
- WhatsApp channel link and support number come from `system_settings`. Buttons open the channel link and `https://wa.me/<number>`.

## 12. Later Phases (not in scope now, keep compatible)

**Phase 3, Customer Android app (Flutter), Phase 4, Admin Android app (Flutter).** They call the same Supabase backend, the same Edge Functions, and use the same RLS rules and brand tokens.

Compatibility rules for Phases 1 and 2:
- Every business action is an Edge Function or Postgres function, not Next.js-only code, so Flutter can reuse it.
- Do not put business logic in Next.js server actions that Flutter could not call.
- Keep response shapes and error codes stable and documented.
- Distribution of the Android apps is planned as a Google Play companion version and a direct-download full version, built from one Flutter codebase. The Play version will not include buying or payment screens. That decision applies in Phase 3, not now.
- The admin Android app will not be listed publicly on Google Play.

## 13. Project Structure and Conventions

```
/apps/web-customer     Phase 1, Next.js customer website
/apps/web-admin        Phase 2, Next.js admin dashboard
/supabase              migrations, seed, edge functions, config
/packages/shared       shared TypeScript types, constants, zod schemas
/apps/android-customer Phase 3 (empty until opened)
/apps/android-admin    Phase 4 (empty until opened)
```
- TypeScript strict mode. Generate types from the Supabase schema.
- Reusable components for forms, status badges, cards, tables, and empty states.
- Accessible, responsive layouts. Admin dashboard must work at tablet width.
- Tests: status transitions, permission checks, RLS policies, and rate snapshot logic.

## 14. Content Style Rules

- Plain, direct copy. No filler marketing language.
- Do not use these words or patterns in UI text, docs, comments, or generated content: elevate, robust, seamless, leverage, unlock, delve, game-changer, and the "not just X, it's Y" construction.
- Error messages say what happened and what the user can do next.

## 15. Working Rules for Coding Agents

1. Read this file and the existing code before changing anything.
2. Work one phase at a time. Finish Phase 1 acceptance criteria before starting Phase 2.
3. Make small, reviewable changes. Do not refactor unrelated code.
4. Every schema change needs a migration. Every table with private data needs RLS in the same migration.
5. Never hardcode games, rates, packages, payment accounts, or support numbers.
6. Never place privileged keys in client code.
7. If a requirement is unclear or conflicts with this file, stop and ask the project owner.
8. Report what changed, what was tested, and what remains.

## 16. Decisions Log and Open Questions

Confirmed:
- Four phases: 1 customer website, 2 admin dashboard, 3 customer Android app, 4 admin Android app.
- Web in Next.js, Android in Flutter, Supabase backend.
- Mandatory login, email + password at launch, phone OTP later if wanted.
- No fixed game list. Everything admin-managed.
- English first, Urdu later. WhatsApp links in settings.
- Colors measured from the client's screens (section 4.1).
- Withdrawals stay in the website scope behind `withdrawals_enabled`.

Open (ask the client):
1. Keep or remove withdrawals (controls the default of `withdrawals_enabled`).
2. Confirmed payment methods and destination accounts for launch.
3. Screenshot retention period (12 months proposed).
4. Exact brand source: logo file, fonts, and any theme seed color.
5. Support WhatsApp number and channel link.
6. Whether phone OTP is wanted later, and who pays for the SMS provider.
7. Business payment account and Play Console organization account (needed before Phase 3).