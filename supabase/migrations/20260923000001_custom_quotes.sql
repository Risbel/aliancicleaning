begin;

-- =====================================================================
-- Custom service plan
-- =====================================================================

insert into public.cleaning_plans
  (type, name, description, base_price, price_per_bedroom, price_per_bathroom,
   price_per_sqft, pet_fee, features, cta_label, image_bg, is_popular, sort_order, is_active)
values
  ('other', 'Other / Custom Service',
   'Tell us what you need and attach photos. We will review it and send you a price.',
   0, 0, 0, 0, 0, array[]::text[], 'Request a Quote', '#cbe0ea', false, 99, true)
on conflict (type) do nothing;

-- =====================================================================
-- Quotes: room details and price are optional for custom requests
-- =====================================================================

alter table public.quotes
  alter column bedrooms drop not null,
  alter column bathrooms drop not null,
  alter column square_footage drop not null,
  add column if not exists service_description text;

comment on column public.quotes.service_description is
  'What the client asked for on a custom (type = other) quote. Distinct from customer_note.';

-- =====================================================================
-- Quote photos
-- =====================================================================

create table if not exists public.quote_photos (
  id           uuid primary key default gen_random_uuid(),
  quote_id     uuid not null references public.quotes(id) on delete cascade,
  storage_path text not null,
  file_name    text,
  uploaded_at  timestamptz not null default now()
);

comment on table public.quote_photos is
  'Photos attached to a quote request. Files live in the private quote-photos storage bucket.';

create index if not exists idx_quote_photos_quote_id on public.quote_photos (quote_id);

alter table public.quote_photos enable row level security;

drop policy if exists "Customers can attach photos to their quotes" on public.quote_photos;
drop policy if exists "Staff can view photos" on public.quote_photos;
drop policy if exists "Customers can view photos on their own quotes" on public.quote_photos;
drop policy if exists "Staff can delete photos" on public.quote_photos;

create policy "Customers can attach photos to their quotes"
on public.quote_photos for insert
to authenticated
with check (
  exists (
    select 1 from public.quotes q
    where q.id = quote_id
      and (q.customer_id = public.current_customer_id() or public.is_staff())
  )
);

create policy "Staff can view photos"
on public.quote_photos for select
using (public.is_staff());

create policy "Customers can view photos on their own quotes"
on public.quote_photos for select
using (
  exists (
    select 1 from public.quotes q
    where q.id = quote_photos.quote_id
      and q.customer_id = public.current_customer_id()
  )
);

create policy "Staff can delete photos"
on public.quote_photos for delete
using (public.is_staff());

-- =====================================================================
-- Storage bucket (private) for the photo files
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('quote-photos', 'quote-photos', false, 51200,
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
set file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types,
    public = excluded.public;

drop policy if exists "Authenticated users can upload quote photos" on storage.objects;
drop policy if exists "Staff and owners can read quote photos" on storage.objects;
drop policy if exists "Staff can delete quote photos" on storage.objects;

create policy "Authenticated users can upload quote photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'quote-photos');

create policy "Staff and owners can read quote photos"
on storage.objects for select
to authenticated
using (bucket_id = 'quote-photos' and (public.is_staff() or owner = auth.uid()));

create policy "Staff can delete quote photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'quote-photos' and public.is_staff());

commit;
