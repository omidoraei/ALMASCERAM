begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.admin_profiles ap
    where ap.user_id = auth.uid() and ap.is_active = true
  );
$$;

create or replace function public.get_admin_role()
returns public.admin_role
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select ap.role from public.admin_profiles ap
  where ap.user_id = auth.uid() and ap.is_active = true
  limit 1;
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (select 1 from public.customer_profiles cp where cp.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.get_admin_role() from public;
revoke all on function public.is_customer() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.get_admin_role() to authenticated;
grant execute on function public.is_customer() to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.update_product_search_vector()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.sku, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.color_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C');
  return new;
end;
$$;

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
begin
  insert into public.customer_profiles (user_id, customer_type, full_name, phone, company_name)
  values (
    new.id,
    case when new.raw_user_meta_data->>'customer_type' in ('individual','business','architect','contractor','distributor')
      then (new.raw_user_meta_data->>'customer_type')::public.customer_type else 'individual' end,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'company_name', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Every mutable table with updated_at receives the same deterministic trigger.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'surface','finishes','spaces','collections','series','products','sizes',
    'size_technical_data','size_pdf_catalog','admin_profiles','customer_profiles',
    'inquiries','collection_seo','series_seo','product_seo'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || table_name || '_updated_at', table_name);
  end loop;
end $$;

create trigger set_product_search_vector
before insert or update of name, sku, color_name, description on public.products
for each row execute function public.update_product_search_vector();

create trigger on_auth_user_created_customer
after insert on auth.users
for each row execute function public.handle_new_customer();

commit;
