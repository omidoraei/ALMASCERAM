begin;

-- CANONICAL DELETE MODEL: catalog records are deactivated in normal admin UI.
-- Physical deletion remains available only to super_admin through explicit hard-delete actions.
alter table public.collections add column if not exists is_active boolean not null default true;
alter table public.series add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists is_active boolean not null default true;

create index if not exists collections_active_published_idx on public.collections(is_active, is_published, sort_order);
create index if not exists series_active_published_idx on public.series(is_active, is_published, sort_order);
create index if not exists products_active_published_idx on public.products(is_active, is_published, sort_order);

-- Remove previous broad policies for the seven primary catalog tables.
do $$
declare policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('surface', 'finishes', 'spaces', 'collections', 'series', 'products', 'sizes')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end
$$;

-- Taxonomies: active rows are public; active admins read/write; only super_admin hard-deletes.
create policy surface_public_select on public.surface for select to anon, authenticated using (is_active);
create policy surface_admin_select on public.surface for select to authenticated using (public.is_admin());
create policy surface_admin_insert on public.surface for insert to authenticated with check (public.is_admin());
create policy surface_admin_update on public.surface for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy surface_super_admin_delete on public.surface for delete to authenticated using (public.get_admin_role() = 'super_admin');

create policy finishes_public_select on public.finishes for select to anon, authenticated using (is_active);
create policy finishes_admin_select on public.finishes for select to authenticated using (public.is_admin());
create policy finishes_admin_insert on public.finishes for insert to authenticated with check (public.is_admin());
create policy finishes_admin_update on public.finishes for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy finishes_super_admin_delete on public.finishes for delete to authenticated using (public.get_admin_role() = 'super_admin');

create policy spaces_public_select on public.spaces for select to anon, authenticated using (is_active);
create policy spaces_admin_select on public.spaces for select to authenticated using (public.is_admin());
create policy spaces_admin_insert on public.spaces for insert to authenticated with check (public.is_admin());
create policy spaces_admin_update on public.spaces for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy spaces_super_admin_delete on public.spaces for delete to authenticated using (public.get_admin_role() = 'super_admin');

-- Catalog hierarchy: every ancestor must be active and published for public visibility.
create policy collections_public_select on public.collections for select to anon, authenticated using (is_active and is_published);
create policy collections_admin_select on public.collections for select to authenticated using (public.is_admin());
create policy collections_admin_insert on public.collections for insert to authenticated with check (public.is_admin());
create policy collections_admin_update on public.collections for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy collections_super_admin_delete on public.collections for delete to authenticated using (public.get_admin_role() = 'super_admin');

create policy series_public_select on public.series for select to anon, authenticated using (
  is_active and is_published and exists (
    select 1 from public.collections c where c.id = collection_id and c.is_active and c.is_published
  )
);
create policy series_admin_select on public.series for select to authenticated using (public.is_admin());
create policy series_admin_insert on public.series for insert to authenticated with check (public.is_admin());
create policy series_admin_update on public.series for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy series_super_admin_delete on public.series for delete to authenticated using (public.get_admin_role() = 'super_admin');

create policy products_public_select on public.products for select to anon, authenticated using (
  is_active and is_published and exists (
    select 1
    from public.series s
    join public.collections c on c.id = s.collection_id
    where s.id = series_id and s.is_active and s.is_published and c.is_active and c.is_published
  )
);
create policy products_admin_select on public.products for select to authenticated using (public.is_admin());
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_admin());
create policy products_admin_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_super_admin_delete on public.products for delete to authenticated using (public.get_admin_role() = 'super_admin');

create policy sizes_public_select on public.sizes for select to anon, authenticated using (
  is_active and exists (
    select 1
    from public.products p
    join public.series s on s.id = p.series_id
    join public.collections c on c.id = s.collection_id
    where p.id = product_id
      and p.is_active and p.is_published
      and s.is_active and s.is_published
      and c.is_active and c.is_published
  )
);
create policy sizes_admin_select on public.sizes for select to authenticated using (public.is_admin());
create policy sizes_admin_insert on public.sizes for insert to authenticated with check (public.is_admin());
create policy sizes_admin_update on public.sizes for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy sizes_super_admin_delete on public.sizes for delete to authenticated using (public.get_admin_role() = 'super_admin');

comment on column public.collections.is_active is 'Canonical soft-delete flag. Public reads require true.';
comment on column public.series.is_active is 'Canonical soft-delete flag. Public reads require true.';
comment on column public.products.is_active is 'Canonical soft-delete flag. Public reads require true.';

commit;
