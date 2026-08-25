begin;

alter table public.surface enable row level security;
alter table public.finishes enable row level security;
alter table public.spaces enable row level security;
alter table public.collections enable row level security;
alter table public.series enable row level security;
alter table public.products enable row level security;
alter table public.sizes enable row level security;
alter table public.size_technical_data enable row level security;
alter table public.size_faces enable row level security;
alter table public.size_media enable row level security;
alter table public.size_spaces enable row level security;
alter table public.size_pdf_catalog enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;
alter table public.pending_inquiries enable row level security;
alter table public.audit_logs enable row level security;
alter table public.collection_seo enable row level security;
alter table public.series_seo enable row level security;
alter table public.product_seo enable row level security;

-- Public taxonomy: only active records are visible; admins can manage all.
create policy surface_public_read on public.surface for select using (is_active);
create policy surface_admin_all on public.surface for all using (public.is_admin()) with check (public.is_admin());
create policy finishes_public_read on public.finishes for select using (is_active);
create policy finishes_admin_all on public.finishes for all using (public.is_admin()) with check (public.is_admin());
create policy spaces_public_read on public.spaces for select using (is_active);
create policy spaces_admin_all on public.spaces for all using (public.is_admin()) with check (public.is_admin());

create policy collections_public_read on public.collections for select using (is_published);
create policy collections_admin_all on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy series_public_read on public.series for select using (is_published and exists (select 1 from public.collections c where c.id = collection_id and c.is_published));
create policy series_admin_all on public.series for all using (public.is_admin()) with check (public.is_admin());
create policy products_public_read on public.products for select using (is_published and exists (select 1 from public.series s where s.id = series_id and s.is_published));
create policy products_admin_all on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy sizes_public_read on public.sizes for select using (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy sizes_admin_all on public.sizes for all using (public.is_admin()) with check (public.is_admin());

create policy size_technical_public_read on public.size_technical_data for select using (exists (select 1 from public.sizes z join public.products p on p.id = z.product_id where z.id = size_id and z.is_active and p.is_published));
create policy size_technical_admin_all on public.size_technical_data for all using (public.is_admin()) with check (public.is_admin());
create policy size_faces_public_read on public.size_faces for select using (exists (select 1 from public.sizes z join public.products p on p.id = z.product_id where z.id = size_id and z.is_active and p.is_published));
create policy size_faces_admin_all on public.size_faces for all using (public.is_admin()) with check (public.is_admin());
create policy size_media_public_read on public.size_media for select using (exists (select 1 from public.sizes z join public.products p on p.id = z.product_id where z.id = size_id and z.is_active and p.is_published));
create policy size_media_admin_all on public.size_media for all using (public.is_admin()) with check (public.is_admin());
create policy size_spaces_public_read on public.size_spaces for select using (exists (select 1 from public.sizes z join public.products p on p.id = z.product_id where z.id = size_id and z.is_active and p.is_published));
create policy size_spaces_admin_all on public.size_spaces for all using (public.is_admin()) with check (public.is_admin());
create policy size_pdf_public_read on public.size_pdf_catalog for select using (exists (select 1 from public.sizes z join public.products p on p.id = z.product_id where z.id = size_id and z.is_active and p.is_published));
create policy size_pdf_admin_all on public.size_pdf_catalog for all using (public.is_admin()) with check (public.is_admin());

-- Admin profile policy is deliberately restrictive to avoid role escalation.
create policy admin_profiles_self_read on public.admin_profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy admin_profiles_super_admin_insert on public.admin_profiles for insert to authenticated with check (public.get_admin_role() = 'super_admin');
create policy admin_profiles_super_admin_update on public.admin_profiles for update to authenticated using (public.get_admin_role() = 'super_admin') with check (public.get_admin_role() = 'super_admin');
create policy admin_profiles_super_admin_delete on public.admin_profiles for delete to authenticated using (public.get_admin_role() = 'super_admin' and user_id <> auth.uid());

create policy customer_profiles_own_read on public.customer_profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy customer_profiles_own_update on public.customer_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy customer_profiles_admin_read on public.customer_profiles for select to authenticated using (public.is_admin());

-- An inquiry owner is resolved through customer_profiles, never from client-supplied identity data.
create policy inquiries_owner_or_admin_read on public.inquiries for select to authenticated using (
  public.is_admin()
  or exists (
    select 1 from public.customer_profiles cp
    where cp.user_id = auth.uid() and cp.user_id = customer_id
  )
);
create policy inquiries_owner_insert on public.inquiries for insert to authenticated with check (
  status = 'submitted'
  and exists (
    select 1 from public.customer_profiles cp
    where cp.user_id = auth.uid() and cp.user_id = customer_id
  )
);
create policy inquiries_admin_update on public.inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy inquiry_items_owner_or_admin_read on public.inquiry_items for select to authenticated using (
  public.is_admin()
  or exists (
    select 1
    from public.inquiries i
    join public.customer_profiles cp on cp.user_id = i.customer_id
    where i.id = inquiry_id and cp.user_id = auth.uid()
  )
);
create policy inquiry_items_owner_or_admin_insert on public.inquiry_items for insert to authenticated with check (
  public.is_admin()
  or exists (
    select 1
    from public.inquiries i
    join public.customer_profiles cp on cp.user_id = i.customer_id
    where i.id = inquiry_id and cp.user_id = auth.uid()
  )
);

-- MVP: no policy of any command is created for pending_inquiries. anon/authenticated are denied.
create policy audit_logs_admin_read on public.audit_logs for select to authenticated using (public.is_admin());
-- Inserts are performed by trusted server code only; clients cannot rewrite audit evidence.

create policy collection_seo_public_read on public.collection_seo for select using (not robots_noindex and exists (select 1 from public.collections c where c.id = collection_id and c.is_published));
create policy collection_seo_admin_all on public.collection_seo for all using (public.is_admin()) with check (public.is_admin());
create policy series_seo_public_read on public.series_seo for select using (not robots_noindex and exists (select 1 from public.series s where s.id = series_id and s.is_published));
create policy series_seo_admin_all on public.series_seo for all using (public.is_admin()) with check (public.is_admin());
create policy product_seo_public_read on public.product_seo for select using (not robots_noindex and exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy product_seo_admin_all on public.product_seo for all using (public.is_admin()) with check (public.is_admin());

commit;
