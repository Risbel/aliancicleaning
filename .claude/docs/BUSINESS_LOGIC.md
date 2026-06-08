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

## 5. Plans

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

## 6. Admin Dashboard

Accessible only to admin users.

### Routes

| Route | Description |
|---|---|
| `/dashboard` | List of all bookings, sorted by upcoming date (soonest first) |
| `/dashboard/clients` | List of all users with `role: client` |
| `/dashboard/plans` | Manage cleaning plans (create, edit, delete) |

### `/dashboard` — Bookings List

- Displays all bookings ordered ascending by `scheduled_date` (nearest first).
- Shows key info: client name, service address, date, time, plan, and status.

### `/dashboard/clients` — Client List

- Displays all registered users with `role: client`.
- Shows contact info: name, email, phone, address, and registration date.

### `/dashboard/plans` — Plan Management

- Admins can create, edit, and delete plans.
- Changes reflect immediately on the landing page.

### Navigation

A persistent **Navbar** inside the dashboard provides links to:
- Bookings (`/dashboard`)
- Clients (`/dashboard/clients`)
- Plans (`/dashboard/plans`)

---

## 7. Route Summary

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with CTAs |
| `/login` | Public | User login |
| `/signup` | Public | User registration |
| `/booking` | Authenticated (client) | Booking form |
| `/dashboard` | Authenticated (admin) | Bookings list |
| `/dashboard/clients` | Authenticated (admin) | Client list |
| `/dashboard/plans` | Authenticated (admin) | Plan management |

---

## 8. Entity Relationship Summary

```
User (1) ──────< Booking (N)

Plan (1) ──────< Booking (N)
Plan ────────────► displayed on Landing Page as Card
```

---

## 9. Business Rules

1. A booking can only be created by an authenticated user with `role: client`.
2. Any unauthenticated CTA click redirects to `/login` or `/signup` before continuing.
3. After login/signup, the user is always redirected to the booking form.
4. Only admin users can access `/dashboard` and its sub-routes.
5. Bookings in the dashboard are always sorted by nearest `scheduled_date` first.
6. A plan with `is_promo: true` must display both the original price and the discounted price.
7. Client contact information (email, phone, address) must be complete to ensure stable communication.
