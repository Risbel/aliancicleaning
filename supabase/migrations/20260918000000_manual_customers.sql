begin;

-- =====================================================================
-- customer_profiles: decouple customer identity from auth identity
-- =====================================================================

alter table public.customer_profiles
  add column user_id uuid references auth.users(id) on delete set null,
  add column source text not null default 'web',
  add column created_by uuid references public.staff_profiles(id) on delete set null;

update public.customer_profiles set user_id = id;

do $$
declare
  fk_name text;
begin
  select con.conname into fk_name
  from pg_constraint con
  join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
  where con.conrelid = 'public.customer_profiles'::regclass
    and con.contype = 'f'
    and con.confrelid = 'auth.users'::regclass
    and att.attname = 'id';

  if fk_name is not null then
    execute format('alter table public.customer_profiles drop constraint %I', fk_name);
  end if;
end $$;

alter table public.customer_profiles
  alter column id set default gen_random_uuid(),
  alter column email drop not null,
  add constraint customer_profiles_user_id_key unique (user_id),
  add constraint customer_profiles_source_check check (source in ('web', 'manual')),
  add constraint customer_profiles_email_required check (source = 'manual' or email is not null);

create index idx_customer_profiles_unclaimed_email
  on public.customer_profiles (lower(email))
  where user_id is null;

-- =====================================================================
-- quotes: email optional for manual clients
-- =====================================================================

alter table public.quotes alter column customer_email drop not null;

-- =====================================================================
-- Helpers
-- =====================================================================

create or replace function public.current_customer_id()
returns uuid as $$
  select id from public.customer_profiles where user_id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function public._merge_customer_profiles(p_source uuid, p_target uuid)
returns public.customer_profiles as $$
declare
  src public.customer_profiles;
  result public.customer_profiles;
begin
  if p_source = p_target then
    raise exception 'Cannot merge a customer into itself';
  end if;

  select * into src from public.customer_profiles where id = p_source for update;
  if src is null then
    raise exception 'Source customer % not found', p_source;
  end if;
  if src.user_id is not null then
    raise exception 'Source customer % is linked to an account and cannot be merged away', p_source;
  end if;

  update public.quotes set customer_id = p_target where customer_id = p_source;

  update public.customer_profiles t set
    phone        = coalesce(t.phone, src.phone),
    email        = coalesce(t.email, src.email),
    address_line = coalesce(t.address_line, src.address_line),
    city         = coalesce(t.city, src.city),
    state        = coalesce(t.state, src.state),
    zip_code     = coalesce(t.zip_code, src.zip_code)
  where t.id = p_target
  returning * into result;

  if result is null then
    raise exception 'Target customer % not found', p_target;
  end if;

  delete from public.customer_profiles where id = p_source;

  return result;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public._merge_customer_profiles(uuid, uuid) from public, anon, authenticated;

create or replace function public.merge_customer_profiles(p_source uuid, p_target uuid)
returns public.customer_profiles as $$
begin
  if not public.is_staff() then
    raise exception 'Only staff can merge customers';
  end if;

  return public._merge_customer_profiles(p_source, p_target);
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.merge_customer_profiles(uuid, uuid) from public, anon;
grant execute on function public.merge_customer_profiles(uuid, uuid) to authenticated;

create or replace function public._claim_customer_profile(p_user_id uuid)
returns public.customer_profiles as $$
declare
  account auth.users;
  own public.customer_profiles;
  manual public.customer_profiles;
begin
  select * into account from auth.users where id = p_user_id;
  if account is null or account.email is null or account.email_confirmed_at is null then
    return null;
  end if;

  select * into own from public.customer_profiles where user_id = p_user_id;

  for manual in
    select * from public.customer_profiles
    where user_id is null and lower(email) = lower(account.email)
    order by created_at
  loop
    if own is null then
      update public.customer_profiles
      set user_id = p_user_id
      where id = manual.id
      returning * into own;
    else
      own := public._merge_customer_profiles(manual.id, own.id);
    end if;
  end loop;

  return own;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public._claim_customer_profile(uuid) from public, anon, authenticated;

create or replace function public.claim_customer_profile()
returns public.customer_profiles as $$
begin
  if auth.uid() is null then
    return null;
  end if;

  return public._claim_customer_profile(auth.uid());
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.claim_customer_profile() from public, anon;
grant execute on function public.claim_customer_profile() to authenticated;

create or replace function public.handle_customer_email_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    perform public._claim_customer_profile(new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_claim_customer_on_insert
after insert on auth.users
for each row execute function public.handle_customer_email_confirmed();

create trigger trg_claim_customer_on_confirm
after update of email_confirmed_at on auth.users
for each row execute function public.handle_customer_email_confirmed();

-- =====================================================================
-- RLS
-- =====================================================================

drop policy if exists "Customers can view own profile" on public.customer_profiles;
drop policy if exists "Customers can update own profile" on public.customer_profiles;
drop policy if exists "Customers can insert own profile" on public.customer_profiles;

create policy "Customers can view own profile"
on public.customer_profiles for select
using (user_id = auth.uid() or public.is_staff());

create policy "Customers can update own profile"
on public.customer_profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Customers can insert own profile"
on public.customer_profiles for insert
with check (user_id = auth.uid() and source = 'web');

create policy "Staff can insert customers"
on public.customer_profiles for insert
with check (public.is_staff());

create policy "Staff can update customers"
on public.customer_profiles for update
using (public.is_staff())
with check (public.is_staff());

create policy "Staff can delete customers"
on public.customer_profiles for delete
using (public.is_staff());

drop policy if exists "Anyone can submit a quote" on public.quotes;
drop policy if exists "Customers can view their own quotes" on public.quotes;

create policy "Anyone can submit a quote"
on public.quotes for insert
with check (
  customer_id is null
  or customer_id = public.current_customer_id()
  or public.is_staff()
);

create policy "Customers can view their own quotes"
on public.quotes for select
using (customer_id = public.current_customer_id());

commit;
