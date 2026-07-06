# Current Database Schema

> Live structure as implemented in Supabase. For the full planned schema (triggers, RLS, views, seed data), see `SCHEMA_PLAN.sql`.

---

## Enums

| Enum            | Values                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| `cleaning_type` | `standard`, `deep`, `move_in`, `move_out`                                         |
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
| `bedrooms`           | `integer`      | NOT NULL, CHECK `>= 0`              |
| `bathrooms`          | `numeric`      | NOT NULL, CHECK `>= 0`              |
| `square_footage`     | `integer`      | NOT NULL, CHECK `> 0`               |
| `has_pets`           | `boolean`      | NOT NULL, DEFAULT `false`           |
| `plan_id`            | `uuid`         | NOT NULL, FK → `cleaning_plans(id)` |
| `desired_visit_date` | `timestamptz`  | NOT NULL                            |
| `estimated_price`    | `numeric`      |                                     |
| `final_price`        | `numeric`      |                                     |
| `status`             | `quote_status` | NOT NULL, DEFAULT `'pending'`       |
| `admin_notes`        | `text`         |                                     |
| `assigned_to`        | `uuid`         | FK → `staff_profiles(id)`           |
| `confirmation_token` | `uuid`         | UNIQUE, set when status becomes `accepted` |
| `created_at`         | `timestamptz`  | NOT NULL, DEFAULT `now()`           |
| `updated_at`         | `timestamptz`  | NOT NULL, DEFAULT `now()`           |

---

## Functions

### `public.get_quote_by_confirmation_token(p_token uuid)`

`SECURITY DEFINER`, returns `setof quotes` matching `confirmation_token = p_token`. The only public read path for a quote — used by the `/confirmation/:token` page so an unauthenticated client can view their accepted quote without a broad RLS policy exposing all quotes. Granted to `anon` and `authenticated`.

---

## Seed Data (applied)

All 3 cleaning plans are inserted:

| type | name | base | /bedroom | /bathroom | /sqft | pet fee |
|------|------|------|----------|-----------|-------|---------|
| `standard` | Standard Cleaning | $50 | $15 | $10 | $0.05 | $15 |
| `deep` | Deep Cleaning | $90 | $25 | $20 | $0.10 | $20 |
| `move_in_out` | Move-In/Move-Out Cleaning | $100 | $25 | $20 | $0.10 | $20 |

---

## RLS (applied)

RLS is enabled on 4 tables with the following policies:

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
| `quote_photos` table | Planned | Not yet created |
| `quote_status_history` table | Planned | Not yet created |
| RLS on `quote_photos` | Planned | Skipped (table not created) |
| RLS on `quote_status_history` | Planned | Skipped (table not created) |
| Triggers | Planned | Not yet applied |
| Views | `pending_quotes_dashboard` planned | Not yet created |
| Seed data | Planned | Applied |
| RLS (core tables) | Planned | Applied |
