begin;

-- =====================================================================
-- Helpers
-- =====================================================================

create or replace function public._user_display_name(p_user_id uuid)
returns text as $$
  select coalesce(
    nullif(trim(cp.full_name), ''),
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), ''),
    split_part(u.email, '@', 1)
  )
  from auth.users u
  left join public.customer_profiles cp on cp.user_id = u.id
  where u.id = p_user_id;
$$ language sql stable security definer set search_path = public;

revoke execute on function public._user_display_name(uuid) from public, anon, authenticated;

create or replace function public._admin_count()
returns bigint as $$
  select count(*) from public.staff_profiles where role = 'admin';
$$ language sql stable security definer set search_path = public;

revoke execute on function public._admin_count() from public, anon, authenticated;

-- =====================================================================
-- Read
-- =====================================================================

create or replace function public.get_staff_members()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.staff_role,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  total_assigned bigint,
  open_quotes bigint,
  completed_quotes bigint,
  cancelled_quotes bigint,
  declined_quotes bigint,
  completed_revenue numeric,
  last_assigned_at timestamptz
) as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Only admins can view staff members';
  end if;

  return query
  select
    sp.id,
    sp.full_name,
    u.email::text,
    sp.role,
    sp.created_at,
    u.last_sign_in_at,
    coalesce(q.total_assigned, 0),
    coalesce(q.open_quotes, 0),
    coalesce(q.completed_quotes, 0),
    coalesce(q.cancelled_quotes, 0),
    coalesce(q.declined_quotes, 0),
    coalesce(q.completed_revenue, 0),
    q.last_assigned_at
  from public.staff_profiles sp
  left join auth.users u on u.id = sp.id
  left join (
    select
      assigned_to,
      count(*) as total_assigned,
      count(*) filter (where status in ('pending', 'reviewed', 'quoted', 'accepted')) as open_quotes,
      count(*) filter (where status = 'completed') as completed_quotes,
      count(*) filter (where status = 'cancelled') as cancelled_quotes,
      count(*) filter (where status = 'declined') as declined_quotes,
      sum(coalesce(final_price, estimated_price)) filter (where status = 'completed') as completed_revenue,
      max(created_at) as last_assigned_at
    from public.quotes
    where assigned_to is not null
    group by assigned_to
  ) q on q.assigned_to = sp.id
  order by sp.full_name;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.get_staff_members() from public, anon;
grant execute on function public.get_staff_members() to authenticated;

create or replace function public.find_user_by_email(p_email text)
returns table (
  id uuid,
  email text,
  full_name text,
  is_staff boolean,
  email_confirmed boolean
) as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'Only admins can look up users';
  end if;

  return query
  select
    u.id,
    u.email::text,
    public._user_display_name(u.id),
    exists (select 1 from public.staff_profiles sp where sp.id = u.id),
    u.email_confirmed_at is not null
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;
end;
$$ language plpgsql stable security definer set search_path = public;

revoke execute on function public.find_user_by_email(text) from public, anon;
grant execute on function public.find_user_by_email(text) to authenticated;

-- =====================================================================
-- Write
-- =====================================================================

create or replace function public.add_staff_member(p_user_id uuid, p_role public.staff_role)
returns public.staff_profiles as $$
declare
  result public.staff_profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can add staff members';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;

  if exists (select 1 from public.staff_profiles where id = p_user_id) then
    raise exception 'This user is already a staff member';
  end if;

  insert into public.staff_profiles (id, full_name, role)
  values (p_user_id, public._user_display_name(p_user_id), p_role)
  returning * into result;

  return result;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.add_staff_member(uuid, public.staff_role) from public, anon;
grant execute on function public.add_staff_member(uuid, public.staff_role) to authenticated;

create or replace function public.set_staff_role(p_user_id uuid, p_role public.staff_role)
returns public.staff_profiles as $$
declare
  member public.staff_profiles;
  result public.staff_profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can change staff roles';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;

  select * into member from public.staff_profiles where id = p_user_id for update;
  if member is null then
    raise exception 'Staff member not found';
  end if;

  if member.role = 'admin' and p_role <> 'admin' and public._admin_count() <= 1 then
    raise exception 'At least one admin is required';
  end if;

  update public.staff_profiles set role = p_role where id = p_user_id returning * into result;

  return result;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.set_staff_role(uuid, public.staff_role) from public, anon;
grant execute on function public.set_staff_role(uuid, public.staff_role) to authenticated;

create or replace function public.remove_staff_member(p_user_id uuid)
returns void as $$
declare
  member public.staff_profiles;
begin
  if not public.is_admin() then
    raise exception 'Only admins can remove staff members';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove yourself';
  end if;

  select * into member from public.staff_profiles where id = p_user_id for update;
  if member is null then
    raise exception 'Staff member not found';
  end if;

  if member.role = 'admin' and public._admin_count() <= 1 then
    raise exception 'At least one admin is required';
  end if;

  update public.quotes set assigned_to = null where assigned_to = p_user_id;

  delete from public.staff_profiles where id = p_user_id;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.remove_staff_member(uuid) from public, anon;
grant execute on function public.remove_staff_member(uuid) to authenticated;

commit;
