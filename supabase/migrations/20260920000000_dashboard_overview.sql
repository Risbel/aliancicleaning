begin;

-- =====================================================================
-- Indexes
-- =====================================================================

create index if not exists idx_quotes_created_at on public.quotes (created_at);
create index if not exists idx_quotes_status_date on public.quotes (status, desired_visit_date);
create index if not exists idx_quotes_assigned_to on public.quotes (assigned_to);

-- =====================================================================
-- Helpers
-- =====================================================================

create or replace function public._dashboard_scope()
returns uuid as $$
begin
  if not public.is_staff() then
    raise exception 'Only staff can view dashboard metrics';
  end if;

  if public.is_admin() then
    return null;
  end if;

  return auth.uid();
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public._dashboard_scope() from public, anon, authenticated;

-- =====================================================================
-- Read
-- =====================================================================

create or replace function public.get_dashboard_kpis(
  p_from timestamptz,
  p_to timestamptz,
  p_prev_from timestamptz
)
returns table (
  revenue numeric,
  prev_revenue numeric,
  requests bigint,
  prev_requests bigint,
  converted bigint,
  prev_converted bigint,
  pending_open bigint,
  unassigned bigint
) as $$
#variable_conflict use_column
declare
  v_scope uuid := public._dashboard_scope();
begin
  return query
  select
    coalesce(sum(coalesce(q.final_price, q.estimated_price)) filter (
      where q.status = 'completed' and q.desired_visit_date >= p_from and q.desired_visit_date < p_to
    ), 0),
    coalesce(sum(coalesce(q.final_price, q.estimated_price)) filter (
      where q.status = 'completed' and q.desired_visit_date >= p_prev_from and q.desired_visit_date < p_from
    ), 0),
    count(*) filter (where q.created_at >= p_from and q.created_at < p_to),
    count(*) filter (where q.created_at >= p_prev_from and q.created_at < p_from),
    count(*) filter (
      where q.created_at >= p_from and q.created_at < p_to and q.status in ('accepted', 'completed')
    ),
    count(*) filter (
      where q.created_at >= p_prev_from and q.created_at < p_from and q.status in ('accepted', 'completed')
    ),
    count(*) filter (where q.status = 'pending' and q.desired_visit_date >= now()),
    count(*) filter (
      where q.assigned_to is null and q.status in ('pending', 'reviewed', 'quoted', 'accepted')
    )
  from public.quotes q
  where v_scope is null or q.assigned_to = v_scope;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_dashboard_kpis(timestamptz, timestamptz, timestamptz) from public, anon;
grant execute on function public.get_dashboard_kpis(timestamptz, timestamptz, timestamptz) to authenticated;

create or replace function public.get_dashboard_revenue_series(
  p_from timestamptz,
  p_to timestamptz,
  p_bucket text,
  p_tz text
)
returns table (
  bucket date,
  revenue numeric,
  jobs bigint
) as $$
#variable_conflict use_column
declare
  v_scope uuid := public._dashboard_scope();
begin
  if p_bucket not in ('day', 'week', 'month') then
    raise exception 'Invalid bucket: %', p_bucket;
  end if;

  if not exists (select 1 from pg_timezone_names where name = p_tz) then
    raise exception 'Invalid time zone: %', p_tz;
  end if;

  return query
  with buckets as (
    select generate_series(
      date_trunc(p_bucket, p_from at time zone p_tz),
      date_trunc(p_bucket, (p_to - interval '1 microsecond') at time zone p_tz),
      ('1 ' || p_bucket)::interval
    ) as bucket_start
  ),
  completed as (
    select
      date_trunc(p_bucket, q.desired_visit_date at time zone p_tz) as bucket_start,
      sum(coalesce(q.final_price, q.estimated_price)) as revenue,
      count(*) as jobs
    from public.quotes q
    where q.status = 'completed'
      and q.desired_visit_date >= p_from
      and q.desired_visit_date < p_to
      and (v_scope is null or q.assigned_to = v_scope)
    group by 1
  )
  select
    b.bucket_start::date,
    coalesce(c.revenue, 0),
    coalesce(c.jobs, 0)
  from buckets b
  left join completed c on c.bucket_start = b.bucket_start
  order by b.bucket_start;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_dashboard_revenue_series(timestamptz, timestamptz, text, text) from public, anon;
grant execute on function public.get_dashboard_revenue_series(timestamptz, timestamptz, text, text) to authenticated;

create or replace function public.get_dashboard_pipeline()
returns table (
  status text,
  total bigint
) as $$
#variable_conflict use_column
declare
  v_scope uuid := public._dashboard_scope();
begin
  return query
  with scoped as (
    select
      case
        when q.status = 'pending' and q.desired_visit_date < now() then 'expired'
        else q.status::text
      end as stage
    from public.quotes q
    where q.status in ('pending', 'reviewed', 'quoted', 'accepted')
      and (v_scope is null or q.assigned_to = v_scope)
  )
  select s.stage, count(scoped.stage)
  from (values ('pending', 1), ('reviewed', 2), ('quoted', 3), ('accepted', 4), ('expired', 5)) as s(stage, position)
  left join scoped on scoped.stage = s.stage
  group by s.stage, s.position
  order by s.position;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_dashboard_pipeline() from public, anon;
grant execute on function public.get_dashboard_pipeline() to authenticated;

create or replace function public.get_dashboard_plan_mix(
  p_from timestamptz,
  p_to timestamptz
)
returns table (
  plan_id uuid,
  plan_name text,
  quotes bigint,
  revenue numeric
) as $$
#variable_conflict use_column
declare
  v_scope uuid := public._dashboard_scope();
begin
  return query
  select
    cp.id,
    cp.name,
    count(q.id),
    coalesce(sum(coalesce(q.final_price, q.estimated_price)) filter (where q.status = 'completed'), 0)
  from public.cleaning_plans cp
  join public.quotes q on q.plan_id = cp.id
  where q.created_at >= p_from
    and q.created_at < p_to
    and (v_scope is null or q.assigned_to = v_scope)
  group by cp.id, cp.name
  order by count(q.id) desc;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_dashboard_plan_mix(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_dashboard_plan_mix(timestamptz, timestamptz) to authenticated;

create or replace function public.get_dashboard_upcoming_jobs(p_limit integer default 5)
returns table (
  id uuid,
  customer_name text,
  city text,
  desired_visit_date timestamptz,
  price numeric
) as $$
#variable_conflict use_column
declare
  v_scope uuid := public._dashboard_scope();
begin
  return query
  select
    q.id,
    q.customer_name,
    q.city,
    q.desired_visit_date,
    coalesce(q.final_price, q.estimated_price)
  from public.quotes q
  where q.status = 'accepted'
    and q.desired_visit_date >= now()
    and (v_scope is null or q.assigned_to = v_scope)
  order by q.desired_visit_date
  limit least(greatest(coalesce(p_limit, 5), 1), 20);
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_dashboard_upcoming_jobs(integer) from public, anon;
grant execute on function public.get_dashboard_upcoming_jobs(integer) to authenticated;

commit;
