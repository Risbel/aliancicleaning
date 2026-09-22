begin;

-- =====================================================================
-- Columns
-- =====================================================================

alter table public.cleaning_plans
  add column if not exists features text[] not null default '{}',
  add column if not exists cta_label text not null default 'Book Now',
  add column if not exists image_bg text,
  add column if not exists is_popular boolean not null default false,
  add column if not exists sort_order integer not null default 0;

create unique index if not exists cleaning_plans_single_popular_idx
  on public.cleaning_plans (is_popular)
  where is_popular;

create index if not exists cleaning_plans_active_order_idx
  on public.cleaning_plans (is_active, sort_order, base_price);

-- =====================================================================
-- Triggers
-- =====================================================================

create or replace function public.handle_cleaning_plan_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_cleaning_plans_updated_at on public.cleaning_plans;

create trigger trg_cleaning_plans_updated_at
before update on public.cleaning_plans
for each row execute function public.handle_cleaning_plan_updated_at();

-- =====================================================================
-- Backfill (previously hardcoded in src/data/services.json)
-- =====================================================================

update public.cleaning_plans
set
  description = 'Regular maintenance cleaning with eco-friendly products, keeping your home fresh, clean, and safe for your pets.',
  features = array[
    'Dusting all surfaces & ceiling fans',
    'Vacuuming & mopping floors',
    'Kitchen & bathroom sanitizing',
    'Baseboards & light switches',
    'Pet-safe, eco-friendly products'
  ],
  image_bg = '#cbe0ea',
  cta_label = 'Book Now',
  is_popular = false,
  sort_order = 0
where type = 'standard';

update public.cleaning_plans
set
  description = 'A thorough top-to-bottom cleaning that removes built-up dirt and leaves every corner of your home spotless.',
  features = array[
    'Everything in Standard',
    'Inside oven & refrigerator',
    'Baseboards, doors & window sills',
    'Blinds & window tracks',
    'Grout & tile scrubbing',
    'Light fixtures & ceiling fans'
  ],
  image_bg = '#156390',
  cta_label = 'Book Now',
  is_popular = true,
  sort_order = 1
where type = 'deep';

update public.cleaning_plans
set
  description = 'Comprehensive cleaning for your move. Whether settling into a new home or preparing to vacate, we ensure every surface meets your standards.',
  features = array[
    'Everything in Deep Cleaning',
    'Inside all cabinets, drawers & closets',
    'Interior window cleaning',
    'Detailed stovetop & appliance deep-clean',
    'Landlord-inspection ready',
    'Move-in fresh start guarantee'
  ],
  image_bg = '#5bb286',
  cta_label = 'Book Now',
  is_popular = false,
  sort_order = 2
where type = 'move_in_out';

commit;
