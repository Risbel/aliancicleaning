# Email Sending — Resend + Supabase Edge Functions

How the project's emails work and how to operate them. Two independent senders, both Resend:

| Function | Trigger |
|----------|---------|
| `send-quote-confirmation` | Staff clicks Send on a quote in the dashboard |
| `send-auth-email` | Supabase Auth needs to send any auth email (signup confirm, password reset, ...) |

---

## Quote confirmation

### What it does

When a staff member clicks **Send** on a quote in the dashboard, the app calls a Supabase Edge Function that:

1. Verifies the caller is logged in and exists in `staff_profiles`.
2. Generates a `confirmation_token` for the quote (if missing) and moves status `pending`/`reviewed` to `quoted`.
3. Sends the client an email via Resend with the visit date, address, price, and a link to `{SITE_URL}/confirmation/{token}`.

If the email fails, the quote update still persists and the dialog shows the confirmation link to share manually.

### Files

| File | Role |
|------|------|
| `supabase/functions/send-quote-confirmation/index.ts` | Edge function: auth check, quote update, template render + send |
| `supabase/functions/send-quote-confirmation/_templates/quote-confirmation.tsx` | React Email template (@react-email/components + Tailwind), brand-styled |
| `supabase/functions/send-quote-confirmation/deno.json` | Import map + JSX options used by the deploy bundler (each function needs its own) |
| `supabase/functions/deno.json` | Import map + compiler options for the editor (Deno extension) |
| `src/services/quotes.ts` | `sendQuoteConfirmation(quoteId)` — invokes the function |
| `src/hooks/queries/use-quotes.ts` | `useSendQuoteConfirmation()` mutation |
| `src/components/dashboard/quotes/SendConfirmationDialog.tsx` | Dashboard UI that triggers the send |

### Previewing the template locally

```sh
pnpm email:dev
```

Starts the React Email preview server at `localhost:3000`, rendering the templates in `supabase/functions/send-quote-confirmation/_templates/` with their default (sample) props. Edits hot-reload.

## Auth emails

### What it does

Supabase Auth normally sends its own auth emails from its built-in mailer with unbranded default templates. The **Send Email Hook** overrides that: instead of sending, Supabase Auth POSTs the user and a token to `send-auth-email`, which renders a branded React Email template and sends it through Resend.

The hook is all-or-nothing — once registered it intercepts **every** auth email type, so the function handles all of them:

| `email_action_type` | Template | Subject |
|---------------------|----------|---------|
| `signup` (and any unknown type) | `confirm-signup` | Confirm your email for Alianci Cleaning |
| `recovery` | `reset-password` | Reset your Alianci Cleaning password |
| `invite` | `confirm-signup` (invite copy) | You have been invited to Alianci Cleaning |
| `magiclink` | `confirm-signup` (sign-in copy) | Your Alianci Cleaning sign-in link |
| `email_change`, `email_change_current`, `email_change_new` | `confirm-signup` (change copy) | Confirm your new email address |
| `reauthentication` | `verification-code` | Your Alianci Cleaning verification code |

`signup` and `recovery` are reachable from the app today (`supabase.auth.signUp` and `supabase.auth.resetPasswordForEmail` in `src/services/auth.ts`); the rest are covered so no auth email is ever silently dropped if a flow is added later.

Action links point at `{SUPABASE_URL}/auth/v1/verify?token={token_hash}&type={type}&redirect_to={redirect_to}`, which is Supabase's own verify endpoint — it consumes the token and then redirects the user to the app.

### Password reset flow

| Step | Where |
|------|-------|
| User clicks **Forgot password?** on the password row of the login form | `src/pages/login/index.tsx` |
| Requests the email; always shows a neutral "check your inbox" state so the page cannot be used to probe which addresses are registered | `src/pages/forgot-password/index.tsx` |
| `resetPasswordForEmail(email, { redirectTo: '{origin}/reset-password' })` triggers the `recovery` email | `src/services/auth.ts` |
| Verify endpoint consumes the token and redirects to `/reset-password` with the recovery session in the URL hash | Supabase |
| Page waits for `loading` to clear (`getSession()` internally awaits Supabase's URL parsing, so this is what guarantees the hash was consumed), then shows the form, or the expired state when the hash carries `error=` or no session exists | `src/pages/reset-password/index.tsx` |
| `updateUser({ password })`, then a success state — the user is already signed in at this point, since the recovery link authenticates them | `src/services/auth.ts` |

**Redirect URLs must be allowlisted.** The verify endpoint only honours `redirect_to` when the URL matches the allowlist in **Authentication → URL Configuration**; otherwise it silently falls back to Site URL and the user lands on the homepage holding a recovery session with no way to use it. Both entries are needed:

```
http://localhost:5173/reset-password
https://www.aliancicleaning.com/reset-password
```

### Files

| File | Role |
|------|------|
| `supabase/functions/send-auth-email/index.ts` | Webhook signature check, type routing, template render + send |
| `supabase/functions/send-auth-email/brand.tsx` | Shared shell: gradient header, logo, Tailwind theme, button, fallback link. Lives outside `_templates/` so the preview server does not try to render it as an email |
| `supabase/functions/send-auth-email/_templates/*.tsx` | The three templates |
| `supabase/functions/send-auth-email/deno.json` | Import map + JSX options for the deploy bundler |

### Previewing the templates locally

```sh
pnpm email:dev:auth
```

Same preview server as the quote template, pointed at `supabase/functions/send-auth-email/_templates/`. Run one at a time — both scripts use port 3000.

### Registering the hook

Dashboard only — the Send Email Hook is not exposed by the Supabase CLI.

1. **Authentication → Hooks → Send Email hook → Enable**, type **HTTPS**, URL `https://xhpkmvznulvrydytqnun.supabase.co/functions/v1/send-auth-email`.
2. Copy the generated secret (format `v1,whsec_...`) and store it as a Supabase secret:
   ```sh
   pnpm dlx supabase secrets set SEND_EMAIL_HOOK_SECRET='v1,whsec_...'
   ```
   The function strips the `v1,` prefix itself before verifying.
3. The function must be deployed with `--no-verify-jwt` (see below) — Auth calls it with a webhook signature, not a JWT, so leaving JWT verification on makes every auth email fail with a 401 before the function runs.

**Rate limit:** Supabase's default auth email rate limit (30/hour on the built-in mailer) still applies to the hook. Raise it under **Authentication → Rate Limits** once the hook is live, since Resend's own limits are what actually matter now.

**To roll back:** disable the hook in the dashboard. Supabase Auth immediately resumes sending its own default emails — no redeploy needed.

## Secrets (Supabase, not in the repo)

Set with `pnpm dlx supabase secrets set NAME=value`. Functions read them at runtime, so changing a secret does not require a redeploy.

| Secret | Value | Used by |
|--------|-------|---------|
| `RESEND_API_KEY` | API key from the Resend dashboard (set) | both |
| `SITE_URL` | `https://aliancicleaning.com` (set) — base URL for confirmation links and email logo | both |
| `EMAIL_FROM` | `Alianci Cleaning <no-reply@aliancicleaning.com>` (set) | both |
| `SEND_EMAIL_HOOK_SECRET` | `v1,whsec_...` generated by the dashboard when the Send Email hook is created | `send-auth-email` |

`SUPABASE_URL` is injected automatically by the platform — do not set it.

## Deploying the functions

```sh
pnpm dlx supabase functions deploy send-quote-confirmation
pnpm dlx supabase functions deploy send-auth-email --no-verify-jwt
```

Requires `pnpm dlx supabase login` and `pnpm dlx supabase link --project-ref xhpkmvznulvrydytqnun` (already done on this machine). The `--no-verify-jwt` flag is **required** on every `send-auth-email` deploy, not just the first.

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
