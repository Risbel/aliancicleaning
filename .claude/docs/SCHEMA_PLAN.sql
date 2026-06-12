-- =====================================================================
-- CLEANING SERVICES COMPANY — SUPABASE SCHEMA (PLANNED)
-- =====================================================================
-- NOTE: This is a future plan. It has NOT been applied to the database yet.
-- =====================================================================
-- This script sets up:
--   1. Enum types
--   2. Tables: staff_profiles, customer_profiles, cleaning_plans, quotes,
--      quote_photos, quote_status_history
--   3. Triggers (updated_at, status history log, auto price calc)
--   4. Pricing calculation function
--   5. Row Level Security (RLS) policies
--   6. A dashboard view for pending quotes ordered by visit date
--   7. Seed data for the 4 cleaning plans
--   8. Storage bucket setup notes for photo uploads
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------

create type public.cleaning_type as enum (
  'standard',
  'deep',
  'move_in',
  'move_out'
);

create type public.quote_status as enum (
  'pending',     -- just submitted, awaiting review
  'reviewed',    -- staff reviewed the request
  'quoted',      -- final price sent to customer
  'accepted',    -- customer confirmed
  'declined',    -- customer declined / staff rejected
  'completed',   -- service performed
  'cancelled'    -- cancelled by either party
);

create type public.staff_role as enum (
  'admin',
  'manager',
  'staff'
);

-- ---------------------------------------------------------------------
-- 2. STAFF / DASHBOARD USERS
--    Linked 1:1 with Supabase Auth users (auth.users)
-- ---------------------------------------------------------------------

create table public.staff_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        public.staff_role not null default 'staff',
  created_at  timestamptz not null default now()
);

comment on table public.staff_profiles is
  'Internal dashboard users (admins, managers, staff) who manage quotes.';

-- ---------------------------------------------------------------------
-- 2b. CUSTOMER PROFILES
--     Linked 1:1 with Supabase Auth users.
-- ---------------------------------------------------------------------

create table public.customer_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null,
  phone        text,
  address_line text,
  city         text,
  state        text,
  zip_code     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.customer_profiles is
  'Client-facing accounts. Customers can log in to view their quotes and reuse saved address info.';

-- ---------------------------------------------------------------------
-- 3. CLEANING PLANS (pricing configuration)
-- ---------------------------------------------------------------------

create table public.cleaning_plans (
  id                 uuid primary key default uuid_generate_v4(),
  type               public.cleaning_type not null unique,
  name               text not null,
  description        text,
  base_price         numeric(10,2) not null default 0.00,
  price_per_bedroom  numeric(10,2) not null default 0.00,
  price_per_bathroom numeric(10,2) not null default 0.00,
  price_per_sqft     numeric(10,4) not null default 0.0000,
  pet_fee            numeric(10,2) not null default 0.00,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.cleaning_plans is
  'Service types and the variables used to compute a quote price.';

-- ---------------------------------------------------------------------
-- 4. QUOTES (the core booking/request table)
-- ---------------------------------------------------------------------

create table public.quotes (
  id                 uuid primary key default uuid_generate_v4(),
  customer_id        uuid references public.customer_profiles(id) on delete set null,
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text not null,
  address_line       text not null,
  city               text,
  state              text,
  zip_code           text,
  bedrooms           integer not null check (bedrooms >= 0),
  bathrooms          numeric(3,1) not null check (bathrooms >= 0),
  square_footage     integer not null check (square_footage > 0),
  has_pets           boolean not null default false,
  plan_id            uuid not null references public.cleaning_plans(id),
  desired_visit_date date not null,
  estimated_price    numeric(10,2),
  final_price        numeric(10,2),
  status             public.quote_status not null default 'pending',
  admin_notes        text,
  assigned_to        uuid references public.staff_profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.quotes is
  'Quote requests submitted through the public booking form.';

create index idx_quotes_status_date on public.quotes (status, desired_visit_date);
create index idx_quotes_created_at  on public.quotes (created_at);
create index idx_quotes_email        on public.quotes (customer_email);
create index idx_quotes_customer_id on public.quotes (customer_id);

-- ---------------------------------------------------------------------
-- 5. QUOTE PHOTOS
-- ---------------------------------------------------------------------

create table public.quote_photos (
  id           uuid primary key default uuid_generate_v4(),
  quote_id     uuid not null references public.quotes(id) on delete cascade,
  storage_path text not null,
  file_name    text,
  uploaded_at  timestamptz not null default now()
);

create index idx_quote_photos_quote_id on public.quote_photos (quote_id);

-- ---------------------------------------------------------------------
-- 6. QUOTE STATUS HISTORY (audit trail)
-- ---------------------------------------------------------------------

create table public.quote_status_history (
  id          uuid primary key default uuid_generate_v4(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  old_status  public.quote_status,
  new_status  public.quote_status not null,
  changed_by  uuid references public.staff_profiles(id),
  changed_at  timestamptz not null default now(),
  note        text
);

create index idx_quote_status_history_quote_id on public.quote_status_history (quote_id);

-- =====================================================================
-- TRIGGERS & AUTOMATION FUNCTIONS
-- =====================================================================

-- Generic updated_at maintainer ----------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger trg_plans_updated_at
before update on public.cleaning_plans
for each row execute function public.set_updated_at();

create trigger trg_customer_profiles_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

-- Status change logger ---------------------------------------------------
create or replace function public.log_quote_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.quote_status_history (quote_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_quote_status_log
after update on public.quotes
for each row execute function public.log_quote_status_change();

-- New Customer profile creator from Supabase Auth auth.users ------------
create or replace function public.handle_new_customer()
returns trigger as $$
begin
  insert into public.customer_profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_handle_new_customer
after insert on auth.users
for each row execute function public.handle_new_customer();

-- =====================================================================
-- PRICING LOGIC
-- =====================================================================

create or replace function public.calculate_quote_price(
  p_plan_id   uuid,
  p_bedrooms  integer,
  p_bathrooms numeric,
  p_sqft      integer,
  p_has_pets  boolean
) returns numeric as $$
declare
  plan public.cleaning_plans;
  price numeric;
begin
  select * into plan from public.cleaning_plans where id = p_plan_id;

  if plan is null then
    raise exception 'Cleaning plan % not found', p_plan_id;
  end if;

  price := plan.base_price
         + (plan.price_per_bedroom  * p_bedrooms)
         + (plan.price_per_bathroom * p_bathrooms)
         + (plan.price_per_sqft     * p_sqft);

  if p_has_pets then
    price := price + plan.pet_fee;
  end if;

  return round(price, 2);
end;
$$ language plpgsql stable;

-- Auto-fill estimated_price hook ----------------------------------------
create or replace function public.set_quote_estimated_price()
returns trigger as $$
begin
  new.estimated_price := public.calculate_quote_price(
    new.plan_id, new.bedrooms, new.bathrooms, new.square_footage, new.has_pets
  );
  return new;
end;
$$ language plpgsql;

create trigger trg_quote_estimated_price
before insert on public.quotes
for each row execute function public.set_quote_estimated_price();

create trigger trg_quote_estimated_price_update
before update on public.quotes
for each row
when (
  old.plan_id        is distinct from new.plan_id or
  old.bedrooms       is distinct from new.bedrooms or
  old.bathrooms      is distinct from new.bathrooms or
  old.square_footage is distinct from new.square_footage or
  old.has_pets       is distinct from new.has_pets
)
execute function public.set_quote_estimated_price();

-- =====================================================================
-- DASHBOARD VIEW — pending quotes ordered by desired visit date
-- =====================================================================

create or replace view public.pending_quotes_dashboard as
select
  q.id,
  q.customer_id,
  q.customer_name,
  q.customer_email,
  q.customer_phone,
  q.address_line,
  q.city,
  q.state,
  q.zip_code,
  q.bedrooms,
  q.bathrooms,
  q.square_footage,
  q.has_pets,
  q.desired_visit_date,
  q.estimated_price,
  q.final_price,
  q.status,
  q.created_at,
  p.name as plan_name,
  p.type as plan_type
from public.quotes q
join public.cleaning_plans p on p.id = q.plan_id
where q.status = 'pending'
order by q.desired_visit_date asc, q.created_at asc;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

alter table public.staff_profiles        enable row level security;
alter table public.customer_profiles     enable row level security;
alter table public.cleaning_plans        enable row level security;
alter table public.quotes                enable row level security;
alter table public.quote_photos          enable row level security;
alter table public.quote_status_history  enable row level security;

-- Helper security function ---------------------------------------------
create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.staff_profiles sp where sp.id = auth.uid()
  );
$$ language sql stable security definer;

-- ---- cleaning_plans RLS ----------------------------------------------
create policy "Public can view active plans"
on public.cleaning_plans for select
using (is_active = true or public.is_staff());

create policy "Staff can manage plans"
on public.cleaning_plans for all
using (public.is_staff())
with check (public.is_staff());

-- ---- quotes RLS -----------------------------------------------------
create policy "Anyone can submit a quote"
on public.quotes for insert
with check (customer_id is null or customer_id = auth.uid());

create policy "Staff can view all quotes"
on public.quotes for select
using (public.is_staff());

create policy "Customers can view their own quotes"
on public.quotes for select
using (customer_id = auth.uid());

create policy "Staff can update quotes"
on public.quotes for update
using (public.is_staff())
with check (public.is_staff());

create policy "Staff can delete quotes"
on public.quotes for delete
using (public.is_staff());

-- ---- quote_photos RLS -----------------------------------------------
create policy "Anyone can attach photos to a quote"
on public.quote_photos for insert
with check (true);

create policy "Staff can view photos"
on public.quote_photos for select
using (public.is_staff());

create policy "Customers can view photos on their own quotes"
on public.quote_photos for select
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_photos.quote_id and q.customer_id = auth.uid()
  )
);

create policy "Staff can delete photos"
on public.quote_photos for delete
using (public.is_staff());

-- ---- quote_status_history RLS ---------------------------------------
create policy "Staff can view status history"
on public.quote_status_history for select
using (public.is_staff());

-- ---- staff_profiles RLS ---------------------------------------------
create policy "Staff can view own profile"
on public.staff_profiles for select
using (id = auth.uid() or public.is_staff());

create policy "Admins manage staff profiles"
on public.staff_profiles for all
using (
  exists (
    select 1 from public.staff_profiles sp
    where sp.id = auth.uid() and sp.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.staff_profiles sp
    where sp.id = auth.uid() and sp.role = 'admin'
  )
);

-- ---- customer_profiles RLS ------------------------------------------
create policy "Customers can view own profile"
on public.customer_profiles for select
using (id = auth.uid() or public.is_staff());

create policy "Customers can update own profile"
on public.customer_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

-- =====================================================================
-- SEED DATA — the 4 cleaning plans
-- =====================================================================

insert into public.cleaning_plans
  (type, name, description, base_price, price_per_bedroom, price_per_bathroom, price_per_sqft, pet_fee)
values
  ('standard',  'Standard Cleaning',
    'Regular upkeep cleaning: dusting, vacuuming, mopping, kitchen & bathroom surfaces.',
    50.00, 15.00, 10.00, 0.05, 15.00),

  ('deep',      'Deep Cleaning',
    'Thorough top-to-bottom cleaning including baseboards, inside appliances, grout, etc.',
    90.00, 25.00, 20.00, 0.10, 20.00),

  ('move_in',   'Move-In Cleaning',
    'Full cleaning of an empty home before move-in, including cabinets and closets.',
    100.00, 25.00, 20.00, 0.10, 20.00),

  ('move_out',  'Move-Out Cleaning',
    'Full cleaning of a vacated home to meet landlord/inspection standards.',
    100.00, 25.00, 20.00, 0.10, 20.00);
