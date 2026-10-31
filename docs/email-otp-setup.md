# Email OTP setup

1. In Supabase, open **Authentication → Providers → Email** and enable **Confirm email**. If it is disabled, Supabase auto-confirms users and no OTP can be required.
2. Open **Authentication → SMTP Settings**.
3. Configure Resend SMTP using a verified sending domain. Keep SMTP credentials in Supabase; never put them in browser environment variables.
4. In **Authentication → Email Templates → Confirm signup**, use `supabase/email-templates/confirm-signup-otp.html`. It must contain `{{ .Token }}` and must not use `{{ .ConfirmationURL }}`.
5. Set the Supabase Auth email OTP expiry to 600 seconds where that setting is available.
6. Apply `supabase/migrations/20261031180000_email_otp.sql`.
7. Set `AUTH_ALLOWED_ORIGINS` for deployed web and Flutter origins. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` remain server-only and are used by application emails such as account deletion; Supabase Auth signup mail uses the SMTP configuration.

Authentication APIs:

- `POST /api/auth/register`
- `POST /api/auth/verify`
- `POST /api/auth/resend`

They accept JSON and form submissions. JSON clients receive consistent JSON responses and CORS headers.
