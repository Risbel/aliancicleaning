begin;

-- =====================================================================
-- Quotes: how long a visit occupies, so the dashboard calendar can draw
-- a real time range instead of a single start instant
-- =====================================================================

alter table public.quotes
  add column if not exists duration_minutes integer
    check (duration_minutes is null or (duration_minutes > 0 and duration_minutes <= 720));

comment on column public.quotes.duration_minutes is
  'How long the visit is expected to occupy, in minutes. Null means fall back to the estimate derived from the plan type and home size.';

create index if not exists idx_quotes_visit_date on public.quotes (desired_visit_date);

commit;
