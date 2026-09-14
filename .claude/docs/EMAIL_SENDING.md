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
| `SITE_URL` | `https://aliancicleaning.vercel.app` (set, **stale** — the `.vercel.app` domain was removed from Vercel; update to `https://aliancicleaning.com`, see Go-live checklist) — base URL for confirmation links |
| `EMAIL_FROM` | Not set yet. Defaults to `Alianci Cleaning <onboarding@resend.dev>` |

## Deploying the function

```sh
pnpm dlx supabase functions deploy send-quote-confirmation
```

Requires `pnpm dlx supabase login` and `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun` (already done on this machine).

## Current limitation (test mode)

The Resend domain is not verified yet, so emails send from `onboarding@resend.dev` and Resend only delivers to the email address the Resend account was created with. Sends to any other recipient fail; the dialog falls back to the manual link.

## Go-live checklist

Prerequisites: access to the Namecheap Advanced DNS panel for `aliancicleaning.com`, the Resend dashboard, and a linked Supabase CLI (`pnpm dlx supabase login` + `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun`). Credentials for all of these are in `CLIENT_HANDOFF.md` (gitignored, local only — don't copy them into this doc).

**Status:** the domain move is already done — Vercel serves `aliancicleaning.com` directly and the `aliancicleaning.vercel.app` domain has been removed from the project. What's left is verifying the Resend sending domain and updating the now-stale `SITE_URL` secret.

1. **Vercel/Namecheap (done):** `aliancicleaning.com` is attached to the Vercel project and serving the live site. No further action needed here.

2. **Resend: verify the sending domain**
   - Resend dashboard → **Domains** → **Add Domain** → enter `aliancicleaning.com`.
   - Add the DNS records Resend shows (SPF `TXT`, DKIM `TXT`/`CNAME`, usually also an `MX` for a `send` subdomain — use exactly what Resend's UI displays, it can vary) in Namecheap → Domain List → Manage → Advanced DNS. These are additive alongside the existing Vercel hosting records — different hosts, no conflict.
   - Wait until Resend marks the domain **Verified** (DNS propagation can take a while, but usually only minutes to a couple hours).

3. **Supabase: update the runtime secrets**
   ```sh
   pnpm dlx supabase secrets set "EMAIL_FROM=Alianci Cleaning <no-reply@aliancicleaning.com>"
   pnpm dlx supabase secrets set SITE_URL=https://aliancicleaning.com
   ```
   The `SITE_URL` update isn't optional cleanup — it currently points at the removed `.vercel.app` domain, so confirmation links are broken until this is set. No redeploy needed; the function reads both at runtime.

4. **Test end-to-end:** send a confirmation to a real external email address (not the Resend account's own address — that's the only address test mode delivers to) and confirm it arrives from `no-reply@aliancicleaning.com`, and that the confirmation link opens `https://aliancicleaning.com/confirmation/<token>` correctly. If it doesn't arrive, check Resend's **Logs** tab first — that's where SPF/DKIM misconfigurations usually show up.

5. **If something's misconfigured:** the app degrades gracefully — a Resend send failure still updates the quote status and the dashboard falls back to showing the confirmation link for manual sharing (existing behavior, no fix needed).

No code changes or redeploys are needed for go-live; all three values above are runtime secrets/config.
