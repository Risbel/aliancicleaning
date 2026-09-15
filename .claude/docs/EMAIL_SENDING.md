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
| `SITE_URL` | `https://aliancicleaning.com` (set) — base URL for confirmation links |
| `EMAIL_FROM` | `Alianci Cleaning <no-reply@aliancicleaning.com>` (set) |

## Deploying the function

```sh
pnpm dlx supabase functions deploy send-quote-confirmation
```

Requires `pnpm dlx supabase login` and `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun` (already done on this machine).

## Go-live checklist (done)

Prerequisites: access to the Namecheap Advanced DNS panel for `aliancicleaning.com`, the Resend dashboard, and a linked Supabase CLI (`pnpm dlx supabase login` + `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun`). Credentials for all of these are in `CLIENT_HANDOFF.md` (gitignored, local only — don't copy them into this doc).

**Status:** fully live. `aliancicleaning.com` is attached to Vercel, the Resend sending domain is **verified**, and both `EMAIL_FROM`/`SITE_URL` Supabase secrets are set. Emails send from `no-reply@aliancicleaning.com` to any recipient (no longer restricted to the Resend account's own address).

1. **Vercel/Namecheap:** `aliancicleaning.com` is attached to the Vercel project and serving the live site.

2. **Resend sending domain — verified.** DNS records added in Namecheap Advanced DNS:
   - DKIM: `TXT resend._domainkey` → `p=MIGfMA0GCSq...` (Resend-generated public key)
   - SPF: `CNAME rsend` → `rsend.forge.rmta.net`, `CNAME send` → `send.forge.rmta.net`
   - These are additive alongside the existing Vercel hosting records — different hosts, no conflict.

3. **Supabase runtime secrets — set:**
   - `EMAIL_FROM=Alianci Cleaning <no-reply@aliancicleaning.com>`
   - `SITE_URL=https://aliancicleaning.com`

4. **If something's misconfigured:** the app degrades gracefully — a Resend send failure still updates the quote status and the dashboard falls back to showing the confirmation link for manual sharing (existing behavior, no fix needed). Check Resend's **Logs** tab first for SPF/DKIM delivery issues.

## BIMI (brand mark in inbox) — done, live

Shows the Alianci Cleaning "A" mark next to the sender name in inboxes that support BIMI (Brand Indicators for Message Identification).

**Status:** live and confirmed working. DMARC is at `p=quarantine`, the `default._bimi` TXT record points at `https://www.aliancicleaning.com/bimi/logo.svg`, and the mark **renders correctly in Yahoo Mail** (confirmed via a real test send). Gmail shows its own default sender-initial avatar instead — expected, see note below, not a misconfiguration.

DNS records in Namecheap Advanced DNS:

- `_dmarc` (TXT): `v=DMARC1; p=quarantine; pct=100;` — moved off `p=none` since BIMI isn't shown by any provider without DMARC enforcement. `quarantine` (not `reject`) since there's no `rua=` reporting address configured to monitor impact; revisit `p=reject` later once confident no legitimate mail is being caught.
- `default._bimi` (TXT): `v=BIMI1; l=https://www.aliancicleaning.com/bimi/logo.svg;` — uses the `www` host, not the bare domain, since `aliancicleaning.com` 308-redirects to `www.aliancicleaning.com` (Vercel's canonical-host redirect) and not every mail provider follows redirects when fetching the BIMI SVG. No `a=` tag (that would point to a VMC — see below).

**Gmail note:** Gmail requires a VMC (Verified Mark Certificate) to show a BIMI mark, regardless of DNS/SVG setup — it currently shows its own default sender-initial avatar instead, which is expected. A VMC needs a registered trademark and costs ~$1,300+/yr from an authorized CA (DigiCert or Entrust) — revisit only if the business registers a trademark for the logo.
