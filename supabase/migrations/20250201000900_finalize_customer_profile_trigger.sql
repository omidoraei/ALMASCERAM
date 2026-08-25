begin;

-- FINAL MVP VERSION: normalize Auth metadata into the customer profile used by inquiry ownership/RPC.
-- Replacing the function is backward-safe because the existing on_auth_user_created_customer trigger
-- resolves the function by OID and immediately uses this new body for future users.
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
begin
  insert into public.customer_profiles (
    user_id,
    customer_type,
    full_name,
    phone,
    company_name,
    city,
    marketing_consent
  )
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'customer_type' in ('individual', 'business', 'architect', 'contractor', 'distributor')
        then (new.raw_user_meta_data->>'customer_type')::public.customer_type
      else 'individual'::public.customer_type
    end,
    left(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), 100),
    left(nullif(btrim(new.raw_user_meta_data->>'phone'), ''), 30),
    left(nullif(btrim(new.raw_user_meta_data->>'company_name'), ''), 100),
    left(nullif(btrim(new.raw_user_meta_data->>'city'), ''), 60),
    coalesce(lower(new.raw_user_meta_data->>'marketing_consent') = 'true', false)
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_customer() is
  'FINAL MVP: creates a bounded customer profile from allow-listed Auth metadata for ownership and inquiry RPC.';

-- Ensure the canonical trigger exists exactly once even on repaired environments.
drop trigger if exists on_auth_user_created_customer on auth.users;
create trigger on_auth_user_created_customer
after insert on auth.users
for each row execute function public.handle_new_customer();

commit;
