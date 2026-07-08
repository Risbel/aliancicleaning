# Email Sending — Resend + Supabase Edge Function

How the quote confirmation email works and how to operate it.

---

## What it does

When a staff member clicks **Send** on a quote in the dashboard, the app calls a Supabase Edge Function that:

1. Verifies the caller is logged in and exists in `staff_profiles`.
2. Generates a `confirmation_token` for the quote (if missing) and moves status `pending`/`reviewed` to `quoted`.
3. Sends the client an email via Resend with the visit date, address, price, and a link to `{SITE_URL}/confirmation/{token}`.

If the email fails, the quote update still persists and the dialog shows the confirmation link to share manually.

## Files

| File | Role |
|------|------|
| `supabase/functions/send-quote-confirmation/index.ts` | Edge function: auth check, quote update, template render + send |
| `supabase/functions/send-quote-confirmation/_templates/quote-confirmation.tsx` | React Email template (@react-email/components + Tailwind), brand-styled |
| `supabase/functions/send-quote-confirmation/deno.json` | Import map + JSX options used by the deploy bundler (each function needs its own) |
| `supabase/functions/deno.json` | Import map + compiler options for the editor (Deno extension) |
| `src/services/quotes.ts` | `sendQuoteConfirmation(quoteId)` — invokes the function |
| `src/hooks/queries/use-quotes.ts` | `useSendQuoteConfirmation()` mutation |
| `src/components/dashboard/quotes/SendConfirmationDialog.tsx` | Dashboard UI that triggers the send |

## Previewing the template locally

```sh
pnpm email:dev
```

Starts the React Email preview server at `localhost:3000`, rendering the templates in `supabase/functions/send-quote-confirmation/_templates/` with their default (sample) props. Edits hot-reload.

## Secrets (Supabase, not in the repo)

Set with `pnpm dlx supabase secrets set NAME=value`. The function reads them at runtime, so changing a secret does not require a redeploy.

| Secret | Value |
|--------|-------|
| `RESEND_API_KEY` | API key from the Resend dashboard (set) |
| `SITE_URL` | `https://aliancicleaning.vercel.app` (set) — base URL for confirmation links |
| `EMAIL_FROM` | Not set yet. Defaults to `Alianci Cleaning <onboarding@resend.dev>` |

## Deploying the function

```sh
pnpm dlx supabase functions deploy send-quote-confirmation
```

Requires `pnpm dlx supabase login` and `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun` (already done on this machine).

## Current limitation (test mode)

The Resend domain is not verified yet, so emails send from `onboarding@resend.dev` and Resend only delivers to the email address the Resend account was created with. Sends to any other recipient fail; the dialog falls back to the manual link.

## Go-live checklist (when the real domain is ready)

1. In Resend: **Domains** > **Add Domain**, enter the production domain, and add the DNS records it shows (SPF, DKIM) at the domain registrar. Wait until Resend marks the domain verified.
2. Update the from address:
   ```sh
   pnpm dlx supabase secrets set "EMAIL_FROM=Alianci Cleaning <no-reply@yourdomain.com>"
   ```
3. If the site moves off the vercel.app URL, update the link base:
   ```sh
   pnpm dlx supabase secrets set SITE_URL=https://yourdomain.com
   ```
4. Send a test: pick a quote with a real external email address and confirm it arrives and the confirmation link opens the site.

No code changes or redeploys are needed for go-live; both values are runtime secrets.
