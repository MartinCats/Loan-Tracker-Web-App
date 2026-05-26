# Loan Tracker Web

## Real Supabase mode

Create `.env.local` from `.env.example` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_PREVIEW_MODE=false
```

`NEXT_PUBLIC_PREVIEW_MODE` can also be omitted for real mode. Keep Supabase RLS managed manually with `supabase/schema.sql`; do not rely on automatic project setup to create policies.

Apply `supabase/schema.sql` in the Supabase SQL Editor before testing real mode. The schema enables RLS and creates explicit owner-scoped policies for loans and payment histories.

For an existing Supabase project, re-run the full `supabase/schema.sql` file after pulling changes. It is written to be idempotent and will refresh the payment history type constraint and owner-scoped RLS policies.

To use local Preview Mode instead, set:

```bash
NEXT_PUBLIC_PREVIEW_MODE=true
```

## LAN preview

To test from a phone on the same Wi-Fi network, start Next bound to all network interfaces:

```bash
npm run dev:lan
npm run dev -- --hostname 0.0.0.0
```
ipconfig getifaddr en0

Then open:

```text
http://YOUR_LAN_IP:3000
```

The Next dev config allows common private LAN hosts such as `192.168.*.*`, `10.*.*.*`, and `172.*.*.*`. If your dev host is different, add comma-separated host patterns to `NEXT_ALLOWED_DEV_ORIGINS`.

For real Supabase mode on a phone, use the same command with real `.env.local` values and preview mode unset or set to `false`.

## Real-mode QA checklist

Auth:
- Sign up with email/password.
- Sign in and sign out.
- Confirm protected routes redirect to `/auth/sign-in` when signed out.
- If email confirmation is enabled in Supabase, confirm the account before sign-in.

Loan data:
- Create a loan.
- Refresh the page and confirm the loan remains.
- Confirm Dashboard and Loans both show real Supabase data.

Payments:
- Record a full payment and confirm the due date advances.
- Record a partial payment and confirm the due date does not advance.
- Record an overpayment and confirm extra credit is stored.
- Record the next payment and confirm credit reduces current due first.
- Refresh and confirm payment history persists.

Reschedule:
- Reschedule an active loan.
- Refresh and confirm the due date remains updated.
- Confirm closed loans cannot be rescheduled.

Close and archive:
- Close an active loan.
- Confirm the app navigates into Archive context.
- Confirm the archived detail is read-only.
- Confirm payment history remains visible.

Delete:
- Delete an active loan and confirm it does not return after refresh.
- Delete an archived loan and confirm it disappears from Archive.
- Confirm related payment history is removed with the loan.

RLS manual check:
- Create loans with two different Supabase users.
- Confirm each user sees only their own Dashboard, Loans, Archive, and Payment History data.
- Confirm a user cannot update, delete, or insert payment histories for another user's loan ID.
