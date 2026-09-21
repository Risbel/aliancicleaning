begin;

-- =====================================================================
-- Table
-- =====================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  info text,
  avatar_url text,
  rating smallint not null default 5,
  quote text not null,
  review_url text,
  reviewed_at date,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by uuid references public.staff_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_name_not_blank check (length(trim(name)) > 0),
  constraint reviews_quote_not_blank check (length(trim(quote)) > 0)
);

create index if not exists reviews_published_order_idx
  on public.reviews (is_published, sort_order, created_at desc);

-- =====================================================================
-- Triggers
-- =====================================================================

create or replace function public.handle_review_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_reviews_updated_at on public.reviews;

create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.handle_review_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.reviews enable row level security;

drop policy if exists "Published reviews are public" on public.reviews;
drop policy if exists "Admins can insert reviews" on public.reviews;
drop policy if exists "Admins can update reviews" on public.reviews;
drop policy if exists "Admins can delete reviews" on public.reviews;

create policy "Published reviews are public"
on public.reviews for select
using (is_published or public.is_staff());

create policy "Admins can insert reviews"
on public.reviews for insert
with check (public.is_admin());

create policy "Admins can update reviews"
on public.reviews for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete reviews"
on public.reviews for delete
using (public.is_admin());

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

commit;
