# Current Database Schema

> Live structure as implemented in Supabase. For the full planned schema (triggers, RLS, views, seed data), see `SCHEMA_PLAN.sql`.

---

## Enums

| Enum            | Values                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| `cleaning_type` | `standard`, `deep`, `move_in_out`, `other`                                        |
| `quote_status`  | `pending`, `reviewed`, `quoted`, `accepted`, `declined`, `completed`, `cancelled` |
| `staff_role`    | `admin`, `manager`, `staff`                                                       |

---

## Tables

### `public.staff_profiles`

Internal dashboard users linked to `auth.users`.

| Column       | Type          | Constraints                 |
| ------------ | ------------- | --------------------------- |
| `id`         | `uuid`        | PK, FK → `auth.users(id)`   |
| `full_name`  | `text`        | NOT NULL                    |
| `role`       | `staff_role`  | NOT NULL, DEFAULT `'staff'` |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()`   |

---

### `public.customer_profiles`

Client-facing accounts linked to `auth.users`.

| Column         | Type          | Constraints               |
| -------------- | ------------- | ------------------------- |
| `id`           | `uuid`        | PK, FK → `auth.users(id)` |
| `full_name`    | `text`        | NOT NULL                  |
| `email`        | `text`        | NOT NULL                  |
| `phone`        | `text`        |                           |
| `address_line` | `text`        |                           |
| `city`         | `text`        |                           |
| `state`        | `text`        |                           |
| `zip_code`     | `text`        |                           |
| `created_at`   | `timestamptz` | NOT NULL, DEFAULT `now()` |
| `updated_at`   | `timestamptz` | NOT NULL, DEFAULT `now()` |

---

### `public.cleaning_plans`

Service types and pricing variables.

| Column               | Type            | Constraints                      |
| -------------------- | --------------- | -------------------------------- |
| `id`                 | `uuid`          | PK, DEFAULT `uuid_generate_v4()` |
| `type`               | `cleaning_type` | NOT NULL, UNIQUE                 |
| `name`               | `text`          | NOT NULL                         |
| `description`        | `text`          |                                  |
| `base_price`         | `numeric`       | NOT NULL, DEFAULT `0.00`         |
| `price_per_bedroom`  | `numeric`       | NOT NULL, DEFAULT `0.00`         |
| `price_per_bathroom` | `numeric`       | NOT NULL, DEFAULT `0.00`         |
| `price_per_sqft`     | `numeric`       | NOT NULL, DEFAULT `0.0000`       |
| `pet_fee`            | `numeric`       | NOT NULL, DEFAULT `0.00`         |
| `is_active`          | `boolean`       | NOT NULL, DEFAULT `true`         |
| `created_at`         | `timestamptz`   | NOT NULL, DEFAULT `now()`        |
| `updated_at`         | `timestamptz`   | NOT NULL, DEFAULT `now()`        |

---

### `public.quotes`

Quote requests submitted through the public booking form.

| Column               | Type           | Constraints                         |
| -------------------- | -------------- | ----------------------------------- |
| `id`                 | `uuid`         | PK, DEFAULT `uuid_generate_v4()`    |
| `customer_id`        | `uuid`         | FK → `customer_profiles(id)`        |
| `customer_name`      | `text`         | NOT NULL                            |
| `customer_email`     | `text`         | NOT NULL                            |
| `customer_phone`     | `text`         | NOT NULL                            |
| `address_line`       | `text`         | NOT NULL                            |
| `city`               | `text`         |                                     |
| `state`              | `text`         |                                     |
| `zip_code`           | `text`         |                                     |
| `bedrooms`           | `integer`      | CHECK `>= 0` — null on custom quotes |
| `bathrooms`          | `numeric`      | CHECK `>= 0` — null on custom quotes |
| `square_footage`     | `integer`      | CHECK `> 0` — null on custom quotes  |
| `has_pets`           | `boolean`      | NOT NULL, DEFAULT `false`           |
| `plan_id`            | `uuid`         | NOT NULL, FK → `cleaning_plans(id)` |
| `desired_visit_date` | `timestamptz`  | NOT NULL                            |
| `estimated_price`    | `numeric`      |                                     |
| `final_price`        | `numeric`      |                                     |
| `status`             | `quote_status` | NOT NULL, DEFAULT `'pending'`       |
| `customer_note`      | `text`         | Free-text request or note from the client (step 1 of the booking form). Required on custom (`other`) quotes, optional otherwise |
| `admin_notes`        | `text`         |                                     |
| `assigned_to`        | `uuid`         | FK → `staff_profiles(id)`           |
| `confirmation_token` | `uuid`         | UNIQUE, set when status becomes `quoted` (generated by `send-quote-confirmation` when the confirmation email is sent) |
| `created_at`         | `timestamptz`  | NOT NULL, DEFAULT `now()`           |
| `updated_at`         | `timestamptz`  | NOT NULL, DEFAULT `now()`           |

---

### `public.quote_photos`

Photos attached to a quote request. The files live in the private `quote-photos` storage bucket; this table only stores their paths.

| Column         | Type          | Constraints                                    |
| -------------- | ------------- | ---------------------------------------------- |
| `id`           | `uuid`        | PK, DEFAULT `gen_random_uuid()`                |
| `quote_id`     | `uuid`        | NOT NULL, FK → `quotes(id)` ON DELETE CASCADE  |
| `storage_path` | `text`        | NOT NULL — path inside the `quote-photos` bucket |
| `file_name`    | `text`        | Original file name                             |
| `uploaded_at`  | `timestamptz` | NOT NULL, DEFAULT `now()`                      |

Index: `idx_quote_photos_quote_id (quote_id)`.

---

## Storage

### `quote-photos` bucket

Private (`public = false`), `file_size_limit` 51200 bytes, `allowed_mime_types` `image/webp`, `image/jpeg`, `image/png`. Objects are keyed `{quote_id}/{uuid}.webp`. Since the bucket is private, reads must go through `createSignedUrls` — `getPublicUrl` returns a URL that fails.

Policies on `storage.objects`, all scoped to `bucket_id = 'quote-photos'`:

| Policy | For | Rule |
|---|---|---|
| Authenticated users can upload quote photos | insert | `to authenticated` — `/booking` is behind `RequireAuth`, so every submitter is signed in |
| Staff and owners can read quote photos | select | `public.is_staff() or owner = auth.uid()` |
| Staff can delete quote photos | delete | `public.is_staff()` |

---

## Functions

### `public.get_quote_by_confirmation_token(p_token uuid)`

`SECURITY DEFINER`, returns `setof quotes` matching `confirmation_token = p_token`. The only public read path for a quote — used by the `/confirmation/:token` page so an unauthenticated client can view their accepted quote without a broad RLS policy exposing all quotes. Granted to `anon` and `authenticated`.

### Staff management (migration `20260919000000_staff_management.sql`)

All are `SECURITY DEFINER`, raise unless `is_admin()`, and are granted to `authenticated` only.

| Function | Returns | Notes |
|---|---|---|
| `get_staff_members()` | table: `id`, `full_name`, `email`, `role`, `created_at`, `last_sign_in_at`, `total_assigned`, `open_quotes`, `completed_quotes`, `cancelled_quotes`, `declined_quotes`, `completed_revenue`, `last_assigned_at` | Joins `staff_profiles` with `auth.users` and a per-assignee aggregate over `quotes`. Open = `pending`/`reviewed`/`quoted`/`accepted`. Revenue = sum of `coalesce(final_price, estimated_price)` over completed quotes. `email`, `last_sign_in_at`, `last_assigned_at` can be null (generated types mark them non-null; `StaffMember` in `src/services/staff.ts` overrides this) |
| `find_user_by_email(p_email text)` | table: `id`, `email`, `full_name`, `is_staff`, `email_confirmed` | Exact, case-insensitive match against `auth.users` only |
| `add_staff_member(p_user_id uuid, p_role staff_role)` | `staff_profiles` | Raises if the user doesn't exist or is already staff |
| `set_staff_role(p_user_id uuid, p_role staff_role)` | `staff_profiles` | Raises on own role or demoting the last admin |
| `remove_staff_member(p_user_id uuid)` | `void` | Raises on self or the last admin. Sets `quotes.assigned_to = null` for the member, then deletes the row |

Internal helpers (execute revoked from all client roles): `_user_display_name(uuid)` (customer profile name → `raw_user_meta_data` `full_name` / `name` → email prefix) and `_admin_count()`.

### Dashboard overview (migration `20260920000000_dashboard_overview.sql`)

All are `STABLE SECURITY DEFINER` and granted to `authenticated` only. They call the internal `_dashboard_scope()` helper (execute revoked from all client roles), which raises unless `is_staff()` and returns `null` for admins (all quotes) or `auth.uid()` otherwise (only quotes where `assigned_to` = caller). Revenue is always `coalesce(final_price, estimated_price)`.

| Function | Returns | Notes |
|---|---|---|
| `get_dashboard_kpis(p_from, p_to, p_prev_from timestamptz)` | one row: `revenue`, `prev_revenue`, `requests`, `prev_requests`, `converted`, `prev_converted`, `pending_open`, `unassigned` | Ranges are `[p_from, p_to)` and `[p_prev_from, p_from)`. Revenue by `desired_visit_date` of `completed` quotes; requests/converted by `created_at`. `pending_open` and `unassigned` are live counts |
| `get_dashboard_revenue_series(p_from, p_to timestamptz, p_bucket text, p_tz text)` | `bucket date`, `revenue numeric`, `jobs bigint` | `p_bucket` in `day` / `week` / `month`; `p_tz` must be in `pg_timezone_names`. Uses `generate_series` so empty buckets return 0 |
| `get_dashboard_pipeline()` | `status text`, `total bigint` | Fixed rows in order: `pending` (visit date not passed), `reviewed`, `quoted`, `accepted`, `expired` (pending past visit date) |
| `get_dashboard_plan_mix(p_from, p_to timestamptz)` | `plan_id uuid`, `plan_name text`, `quotes bigint`, `revenue numeric` | Quotes created in range per plan; revenue from the `completed` ones. Plans with no quotes are omitted |
| `get_dashboard_upcoming_jobs(p_limit int default 5)` | `id`, `customer_name`, `city`, `desired_visit_date`, `price` | `accepted` quotes with a future visit date, soonest first. Limit clamped to 1-20 |

Indexes added (`if not exists`): `idx_quotes_created_at (created_at)`, `idx_quotes_status_date (status, desired_visit_date)`, `idx_quotes_assigned_to (assigned_to)`.

---

## Seed Data (applied)

All 3 cleaning plans are inserted:

| type | name | base | /bedroom | /bathroom | /sqft | pet fee |
|------|------|------|----------|-----------|-------|---------|
| `standard` | Standard Cleaning | $50 | $15 | $10 | $0.05 | $15 |
| `deep` | Deep Cleaning | $90 | $25 | $20 | $0.10 | $20 |
| `move_in_out` | Move-In/Move-Out Cleaning | $100 | $25 | $20 | $0.10 | $20 |
| `other` | Other / Custom Service | $0 | $0 | $0 | $0 | $0 |

The `other` plan is the unpriced custom-service path: it is `is_active` (so the booking form and `?plan=other` resolve it) with every price variable at 0, and quotes against it carry a null `estimated_price` until staff set `final_price`.

---

## RLS (applied)

RLS is enabled on 5 tables with the following policies:

**`is_staff()` helper function** — applied, used across policies.

**`cleaning_plans`**
- Public can view active plans (or if staff)
- Staff can manage plans (all operations)

**`quotes`**
- Anyone can submit a quote
- Staff can view all quotes
- Customers can view their own quotes
- Staff can update quotes
- Staff can delete quotes

**`quote_photos`**
- Customers can attach photos to their quotes (insert; must own the quote, or be staff)
- Staff can view photos
- Customers can view photos on their own quotes
- Staff can delete photos

**`staff_profiles`**
- Staff can view own profile (or any staff)
- Admins manage staff profiles (all operations)

**`customer_profiles`**
- Customers can view own profile (or if staff)
- Customers can update own profile

---

## Differences from Plan

| Area | Plan | Current DB |
|------|------|------------|
| `desired_visit_date` type | `date` | `timestamptz` |
| `quote_photos` table | Planned | Applied (`20260923000001_custom_quotes.sql`) |
| `quote_status_history` table | Planned | Not yet created |
| RLS on `quote_photos` | Planned | Applied |
| RLS on `quote_status_history` | Planned | Skipped (table not created) |
| Triggers | Planned | Not yet applied |
| Views | `pending_quotes_dashboard` planned | Not yet created |
| Seed data | Planned | Applied |
| RLS (core tables) | Planned | Applied |
