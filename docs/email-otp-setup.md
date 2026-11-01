# Email confirmation setup

For local development without SMTP, open **Authentication → Providers → Email** and disable **Confirm email**. New users can sign up and log in immediately. Before production, enable **Confirm email** and configure SMTP below; the same application then uses confirmation links without code changes.
2. Open **Authentication → SMTP Settings**.
3. Configure Resend SMTP using a verified sending domain. Keep SMTP credentials in Supabase; never put them in browser environment variables.
4. In **Authentication → Email Templates → Confirm signup**, use `supabase/email-templates/confirm-signup-link.html`.
5. Set the Site URL to `http://localhost:3000` for local testing and configure the production URL when deployed.
6. Set `AUTH_ALLOWED_ORIGINS` for deployed web and Flutter origins. `RESEND_API_KEY` and `RESEND_FROM_EMAIL` remain server-only and are used by application emails such as account deletion; Supabase Auth signup mail uses the SMTP configuration.

If registration returns `Error sending confirmation email`, check Supabase **Authentication → SMTP Settings** and **Authentication → Logs**. The `RESEND_API_KEY` in the Next.js environment does not configure Supabase Auth email delivery.

Authentication APIs:

- `POST /api/auth/register`
- `POST /api/auth/verify` (legacy OTP endpoint)
- `POST /api/auth/resend` (legacy OTP endpoint)

They accept JSON and form submissions. JSON clients receive consistent JSON responses and CORS headers.
