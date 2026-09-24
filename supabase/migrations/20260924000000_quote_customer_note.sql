begin;

-- =====================================================================
-- Quotes: one free-text field for what the client asked for
-- =====================================================================

-- customer_note predates the migrations folder and has no migration of its
-- own, so a fresh `supabase db reset` would not create it.
alter table public.quotes
  add column if not exists customer_note text,
  drop column if exists service_description;

comment on column public.quotes.customer_note is
  'Free-text request or note from the client, collected in step 1 of the booking form.';

commit;
