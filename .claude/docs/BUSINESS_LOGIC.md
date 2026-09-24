# BUSINESS_LOGIC.md — Alianci Cleaning

## Overview

**Project Name:** Alianci Cleaning
**Business Type:** Cleaning Services
**Primary Goal:** A single landing page that drives users to book cleaning appointments through clear calls to action (CTAs).

---

## 1. Landing Page

The landing page is the sole public-facing page. Its purpose is to convert visitors into clients by showcasing the service and prompting them to make a booking.

### Key Elements
- Hero section with a primary CTA ("Book Now", "Schedule a Cleaning", etc.)
- Services / Plans section (see [Plans](#5-plans))
- Additional CTAs distributed throughout the page to maximize conversion

### Booking Flow (Unauthenticated User)
1. Visitor clicks any CTA on the landing page.
2. System checks authentication status.
3. If **not authenticated** → redirect to `/login` or `/signup`.
4. After successful login/signup → redirect to the **Booking Form**.

---

## 2. Authentication

| Route | Description |
|---|---|
| `/login` | Existing users sign in |
| `/signup` | New users create an account |

After authentication, the system redirects the user to the booking form to complete their reservation.

---

## 3. Users

The `User` entity represents every person registered in the system.

### User Table — Fields

| Field | Type | Description |
|---|---|---|
| `id` | UUID / Int | Primary key |
| `name` | String | Full name |
| `email` | String | Unique email address |
| `phone` | String | Contact phone number |
| `address` | String | Home / service address |
| `password` | String (hashed) | Authentication credential |
| `is_admin` | Bool | |
| `created_at` | Timestamp | Account creation date |
| `updated_at` | Timestamp | Last update date |

### Roles

| Role | Access |
|---|---|
| `client` | Can create and view their own bookings |
| `admin` | Can access `/dashboard` and manage all bookings and clients |

---

## 4. Bookings

A `Booking` is created when an authenticated client submits the booking form. It is always associated with a user.

### Booking Form — Required Fields

| Field | Type | Description |
|---|---|---|
| `id` | UUID / Int | Primary key |
| `user_id` | FK → User | The client who made the booking |
| `plan_id` | FK → Plan | The selected cleaning plan |
| `service_address` | String | Address where the service will be performed |
| `scheduled_date` | Date | Requested date for the cleaning |
| `scheduled_time` | Time | Requested time slot |
| `notes` | Text (optional) | Additional instructions or special requests |
| `status` | Enum | `pending`, `confirmed`, `completed`, `cancelled` |
| `created_at` | Timestamp | Booking creation date |

### Booking Flow (Authenticated User)
1. User is redirected to the booking form after login.
2. User fills in service details and selects a plan.
3. On submission, a booking record is created and linked to the user.
4. User receives confirmation (on-screen and/or email).

---

## 5. Quotes

A `Quote` is created when a visitor submits the public quote/booking form, before it becomes a confirmed service. Staff can also create quotes on a client's behalf (e.g. taken over the phone) via the **New quote** action on `/dashboard/clients`, for both manual clients and account holders. Staff manage the quote lifecycle from `/dashboard/quotes`.

### Custom quotes ("Other" plan)

A client whose job is not covered by the three priced plans picks **Other / Custom Service** in the booking form, or arrives straight there from the "Need something else?" banner under the Services section (`/booking?plan=other`).

- Step 1 swaps the home details (bedrooms, bathrooms, square footage, pets) for a **service description** — the same `customer_note` field every plan collects, but required here and at least 20 characters. Steps 2 and 3 are unchanged.
- Photos are compressed in the browser to **10 KB or less** each (`browser-image-compression`, WebP, 1280px then 640px). They are held in memory during the wizard and uploaded only after the quote row exists, so an abandoned form leaves nothing behind. If the upload fails the quote still stands and the client is told we will follow up.
- The quote is stored with `bedrooms`, `bathrooms`, `square_footage` and `estimated_price` all null — there is no auto-estimate to compute. Staff read the note and photos in the quote details dialog, then set `final_price` and send the confirmation as usual.
- Files live in the private `quote-photos` storage bucket; `quote_photos` rows hold their paths. Staff and the owning customer read them through short-lived signed URLs.
- **Book Again** on a custom quote in `/my-quotes` returns to step 1 with the plan, address and note prefilled (a normal rebook carries its note too, but still jumps straight to step 2). Photos are not carried over — the client re-attaches whatever is relevant to the new job.

### Staff-created quotes

- Linked to the client via `customer_id`; contact snapshot (`customer_name`, `customer_email`, `customer_phone`) is taken from the client record. `customer_email` is `null` for manual clients without an email.
- Created as `pending` and unassigned — assignment remains an admin action.
- `estimated_price` is auto-calculated from the plan formula as in the public form; staff may optionally set `final_price` at creation.
- If the client record had no phone, the phone entered in the quote is saved back to the client.
- Quotes created for an account holder appear in their `/my-quotes`.

### Quote Table — Key Fields

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `customer_id` | FK → `customer_profiles` | Nullable — set if the requester has an account |
| `customer_name` / `customer_email` / `customer_phone` | String | Contact info. Email is never editable by staff once submitted. |
| `address_line`, `city`, `state`, `zip_code` | String | Service address |
| `plan_id` | FK → `cleaning_plans` | Selected cleaning plan |
| `bedrooms`, `bathrooms`, `square_footage`, `has_pets` | — | Inputs used to compute `estimated_price`. Null on custom quotes |
| `customer_note` | Text | What the client asked for or wants us to know. Required (20+ characters) on custom quotes, optional on priced plans |
| `desired_visit_date` | Timestamp | Client's requested date, including the start hour |
| `duration_minutes` | Integer | How long the visit occupies, set by staff in the Edit dialog. Null means the calendar falls back to a duration estimated from the plan type and home size |
| `estimated_price` | Decimal | Auto-calculated at submission time from the plan's pricing formula. Read-only reference for staff. Null on custom quotes. |
| `final_price` | Decimal | Set/adjusted by staff — the actual quoted price once reviewed |
| `status` | Enum | See Statuses below |
| `assigned_to` | FK → `staff_profiles` | The staff member responsible for the quote |
| `confirmation_token` | UUID | Generated when status becomes `accepted`; powers the public confirmation link |

### Statuses

| Status | Meaning |
|---|---|
| `pending` | Just submitted by the client; not yet looked at. |
| `reviewed` | The assigned staff member has looked at the quote. |
| `quoted` | Staff has sent the client an adjusted final price (e.g. for extras or special treatments not captured by the auto-estimate). |
| `accepted` | Staff finalized the price and sent the client a confirmation email with an "Accept" button. Clicking it opens a public `/confirmation/:token` page showing the reservation success and quote details (price, address, visit date). **Email dispatch is not yet implemented** (no email infrastructure exists in this repo) — until it is, the first time a quote is set to `accepted` a dialog pops up with the confirmation link for staff to copy and send manually. |
| `declined` | The client did not want the service after review/conversation with staff — a disagreement or change of mind. |
| `completed` | The service was carried out. |
| `cancelled` | The service did not happen for a reason unrelated to disagreement (weather, client unavailable, accident, etc.) — distinct from `declined`. |

Status changes are free-form: staff can set any status at any time via the "Change status" row action (an accessible dropdown submenu of radio options), applied optimistically with a loading indicator until the update settles. There is no enforced transition graph.

### Assignment

- Only `admin` staff can assign a quote to a staff member (`assigned_to`). The "Assign" action is hidden entirely for non-admin staff.
- Any `staff_profiles` row (any role) can be the assignee.

### Dashboard Actions (`/dashboard/quotes`)

- **Edit** — opens a modal to update `customer_phone`, `final_price`, the visit date, the exact start hour, `duration_minutes` and `admin_notes`. Email is shown but not editable. Leaving Duration on "Estimated" stores null, so the block keeps tracking the estimate.
- **Change status** — a row action (dropdown submenu) that sets `status` directly via radio options; the update is applied optimistically with a loading indicator until the mutation settles, and rolls back on failure. Setting status to `accepted` for the first time generates `confirmation_token` and opens a dialog with the confirmation link to copy/share.
- **Send confirmation** — a dedicated row action, disabled until `final_price` is set. Marks the quote `accepted` and generates `confirmation_token` if not already set, then opens a dialog summarizing the desired visit date, address, estimated price, and final price alongside the `/confirmation/:token` link — since email dispatch isn't implemented, staff copy/send this manually. Can be re-run on an already-accepted quote to re-share the link.
- **Assign** — admin-only, opens a modal to set `assigned_to` from the list of staff.
- **Delete** — hard delete after a confirmation dialog.

### Calendar view (`/dashboard/quotes?view=calendar`)

A segmented **List / Calendar** toggle sits in the page toolbar. The calendar answers the planning questions the table cannot: what a day actually looks like hour by hour, what time is still free, and whether a staff member is double-booked.

| Param | Values | Default |
|---|---|---|
| `view` | `list` / `calendar` | `list` — so every existing deep link opens the table unchanged |
| `cal` | `month` / `week` / `day` | `week` |
| `date` | `yyyy-MM-dd` anchor | today |

- **Hours shown** are 8:00-21:00, matching the slots a client can book (`TIME_SLOT_HOURS`). Jobs outside the window are clamped to the edge with a squared-off corner.
- **Duration**: each block spans `duration_minutes`, or a duration estimated from the plan type plus bedrooms, bathrooms and square footage when it is null (`src/lib/quote-duration.ts`). A "(est.)" suffix marks the estimated ones in Day view.
- **Statuses drawn**: by default `pending`, `reviewed`, `quoted`, `accepted` and `completed`. Unconfirmed statuses render dashed and translucent; `accepted` and `completed` render solid, so committed work is distinguishable at a glance. The status tag row filters the calendar as it filters the table — its default chip reads **Scheduled**, and **Expired** is hidden (the calendar is already a date filter). Picking **All** also draws `declined` and `cancelled`.
- **Month** shows up to 3 chips per day plus "+N more" and a load bar (busy minutes over the 13-hour window). Clicking a day opens Day view.
- **Week** shows 7 columns with a per-day "3h booked" subheader and a live "now" line on today. Below `md` it collapses to the anchor day with a day strip to move between days.
- **Day** adds an availability rail: booked / free / job totals, the **open slots** between jobs (gaps of 2h or more emphasised), and any **conflicts** — two jobs overlapping that are assigned to the same staff member. Conflicting blocks also get a red ring. Overlapping jobs share the column width rather than hiding each other.
- Blocks show the client name, the time range and the **assigned staff member** (or "Unassigned"); month chips show the time and client only. Hovering a block opens a **hover card** (`src/components/ui/hover-card.tsx`, built on the `radix-ui` HoverCard already in the project) with the status, date, time range, duration, assignee, plan, address, phone, price and the first lines of the customer note.
- Clicking a block opens the quote details dialog (which also lists **Assigned to**); the `⋯` menu on a block is the same `QuoteRowActions` component the table rows use, so status changes, assignment, confirmations and deletion behave identically in both views.
- Non-admin staff see only their own assigned quotes here, exactly as in the list.

Admins can filter the list by assignee with `?assigned=<staff id>` (linked from **View quotes** on `/dashboard/staff`); a removable "Assigned to" chip shows the active filter. Non-admin staff always see only their own assigned quotes, regardless of this param.

---

## 6. Plans

Plans are standalone entities used to display the available cleaning service packages on the landing page. They are managed by admins via the dashboard.

### Plan Table — Fields

| Field | Type | Description |
|---|---|---|
| `id` | UUID / Int | Primary key |
| `title` | String | Plan name (e.g., "Basic", "Premium") |
| `description` | String | Short summary of what the plan includes |
| `perks` | Array / JSON | List of features / benefits included in the plan |
| `price` | Decimal | Base price of the plan |
| `discount` | Decimal (optional) | Discount percentage applied when on promo |
| `is_promo` | Boolean | Flag to indicate if the plan is currently on promotion |
| `created_at` | Timestamp | Creation date |

### Plan Card Display

Each plan is rendered as a card on the landing page showing:
- Title
- Description
- List of perks (bullet/check list)
- Price
- Discounted price (if `is_promo` is `true`)

---

## 7. Admin Dashboard

Accessible to any staff member (`staff_profiles` row). `/dashboard/plans` and `/dashboard/staff` are restricted to `admin`.

### Routes

| Route | Description |
|---|---|
| `/dashboard` | Overview: KPIs, revenue, pipeline, plan mix, upcoming jobs |
| `/dashboard/quotes` | Quotes list and management |
| `/dashboard/clients` | List of all users with `role: client` |
| `/dashboard/plans` | Manage cleaning plans (create, edit, delete) — admin only |
| `/dashboard/staff` | Manage staff members, roles, and view per-member performance — admin only |

### `/dashboard` — Overview

A minimal performance overview. Admins see business-wide numbers; non-admin staff see only quotes assigned to them. The scope is enforced in the database functions (see `SCHEMA_CURRENT.md`), not only in the UI.

A range select (Last 7 days / 30 days (default) / 90 days / 12 months) is stored in the URL as `?range=`. Ranges include today and use the browser time zone.

**KPI cards** (range-based cards compare against the previous period of the same length)

| Card | Definition |
|---|---|
| Revenue | Sum of `final_price` (falling back to `estimated_price`) of `completed` quotes whose `desired_visit_date` is in the range |
| Quote requests | Quotes whose `created_at` is in the range |
| Conversion rate | Quotes created in the range that are now `accepted` or `completed`, divided by quote requests; delta shown in percentage points |
| Awaiting review | Live count of `pending` quotes whose visit date has not passed. Admins also see how many open quotes (`pending`, `reviewed`, `quoted`, `accepted`) are unassigned. Links to `/dashboard/quotes?status=pending` |

**Widgets**

- **Revenue**: area chart of completed revenue per day (7d/30d), week (90d), or month (12m), bucketed by visit date. Empty buckets are 0. The tooltip also shows completed jobs.
- **Upcoming jobs**: the next 5 `accepted` quotes with a future visit date (date, client, city, price). "View all" opens `/dashboard/quotes?status=accepted`.
- **Pipeline**: live horizontal bars for `pending`, `reviewed`, `quoted`, `accepted`, and `expired` (pending past the visit date). Not affected by the range. Clicking a bar opens `/dashboard/quotes` filtered to that status.
- **Plan mix**: donut of quote requests per cleaning plan in the range, with share and completed revenue. Plan colors are assigned by plan name so they stay stable; more than 3 plans fold into "Other".

Any quote mutation (create, edit, status change, send confirmation, delete) invalidates the dashboard cache.

### `/dashboard/clients` — Client List

- Displays all registered users with `role: client`.
- Shows contact info: name, email, phone, address, and registration date.
- Row actions: **New quote** (create a quote for that client), Edit, View quotes, and Merge into account (manual clients only).

### `/dashboard/plans` — Plan Management

- Admins can create, edit, and delete plans.
- Changes reflect immediately on the landing page.

### `/dashboard/staff` — Staff Management

Admin-only. Lists every `staff_profiles` row with the member's email and last sign-in (read from `auth.users` through the admin-only `get_staff_members()` RPC).

**Roles**

| Role | Access |
|---|---|
| `admin` | Full access: sees all quotes, assigns quotes, manages plans and staff |
| `manager` | Team lead label. Currently the same dashboard access as `staff` |
| `staff` | Sees and works on the quotes assigned to them |

**Actions**

- **Add staff** — look up a registered user by their exact email (case-insensitive; no partial search, so the lookup cannot be used to browse users). The result shows the name, whether they are already staff, and whether their email is verified. Pick a role and add them. The user must have signed up on the site first. The staff `full_name` is taken from their customer profile, then their auth metadata, then the email prefix.
- **Change role** — radio options for admin / manager / staff.
- **View quotes** — opens `/dashboard/quotes?status=all&assigned=<id>`, filtered to that member.
- **Remove** — deletes the `staff_profiles` row after a confirmation dialog. All quotes assigned to the member are unassigned first. The auth account and any customer profile are kept, so they can still sign in as a client.

**Rules (enforced in the database functions)**

- An admin cannot change their own role or remove themselves. The UI hides those actions on the current user's row.
- At least one admin must always remain: the last admin cannot be demoted or removed.

**Performance metrics** (per member, computed from quotes where `assigned_to` = member)

| Metric | Definition |
|---|---|
| Open | Assigned quotes with status `pending`, `reviewed`, `quoted`, or `accepted` |
| Completed | Assigned quotes with status `completed` |
| Completion rate | `completed / (completed + cancelled + declined)`; shown as `-` when no assigned quote has closed |
| Revenue | Sum of `final_price` (falling back to `estimated_price`) over completed quotes |
| Last active | Last sign-in from `auth.users` |
| Joined | `staff_profiles.created_at` (hidden column by default) |

Summary cards at the top total Team members, Open assignments, Completed jobs, and Completed revenue across all members. The table supports role filter tags (All / Admin / Manager / Staff), client-side search by name or email, sorting, column visibility, and pagination.

### Navigation

All `/dashboard/*` routes share `DashboardLayout`, a collapsible shadcn **Sidebar** (collapses to icons, `Ctrl/Cmd+B` toggles) with links to:
- Overview (`/dashboard`)
- Quotes (`/dashboard/quotes`)
- Clients (`/dashboard/clients`)
- Staff (`/dashboard/staff`) — shown only to admins
- Plan Pricing (`/dashboard/plans`) — shown only to admins

The sidebar footer has a "Back to site" link. From the public site, staff reach the dashboard through a single **Dashboard** item in the navbar `UserMenu` dropdown (which otherwise contains only My Quotes and Sign out).

---

## 8. Route Summary

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with CTAs |
| `/login` | Public | User login |
| `/signup` | Public | User registration |
| `/booking` | Authenticated (client) | Booking form |
| `/dashboard` | Authenticated (staff) | Dashboard overview (metrics and charts) |
| `/dashboard/clients` | Authenticated (staff) | Client list |
| `/dashboard/plans` | Authenticated (admin) | Plan management |
| `/dashboard/quotes` | Authenticated (staff) | Quotes list and management |
| `/dashboard/staff` | Authenticated (admin) | Staff management and performance |
| `/confirmation/:token` | Public | Reservation confirmation page reached from the accepted-quote link |

---

## 9. Entity Relationship Summary

```
User (1) ──────< Booking (N)

Plan (1) ──────< Booking (N)
Plan ────────────► displayed on Landing Page as Card
```

---

## 10. Business Rules

1. A booking can only be created by an authenticated user with `role: client`.
2. Any unauthenticated CTA click redirects to `/login` or `/signup` before continuing.
3. After login/signup, the user is always redirected to the booking form.
4. Only staff users can access `/dashboard` and its sub-routes; `/dashboard/plans` and `/dashboard/staff` are admin-only.
5. Bookings in the dashboard are always sorted by nearest `scheduled_date` first.
6. A plan with `is_promo: true` must display both the original price and the discounted price.
7. Client contact information (email, phone, address) must be complete to ensure stable communication.
8. A quote's `customer_email` can never be edited by staff — only `customer_phone`, `final_price`, `status`, and `assigned_to` are staff-editable.
9. Only `admin` staff can assign a quote to a staff member; the assign action is invisible to non-admin staff, not merely disabled.
10. A quote's `confirmation_token` is generated once, the first time its status becomes `accepted`, and never regenerated afterward.
11. Only admins can add, re-role, or remove staff. An admin cannot change their own role or remove themselves, and the last admin can never be demoted or removed.
12. Removing a staff member unassigns their quotes and keeps their auth account and customer profile.
