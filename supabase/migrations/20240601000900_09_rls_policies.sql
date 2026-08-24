-- =============================================================================
-- Migration 09: Row Level Security (RLS) Policies
-- لایه: 7 | اصل حاکم: Least Privilege + Security by Design
-- =============================================================================

-- -----------------------------------------------------------------------------
-- فعال‌سازی RLS روی تمام جداول (پیش‌فرض: انکار کامل دسترسی)
-- -----------------------------------------------------------------------------
alter table public.surface               enable row level security;
alter table public.finishes              enable row level security;
alter table public.spaces                enable row level security;
alter table public.collections           enable row level security;
alter table public.series                enable row level security;
alter table public.products              enable row level security;
alter table public.sizes                 enable row level security;
alter table public.size_technical_data   enable row level security;
alter table public.size_faces            enable row level security;
alter table public.size_media            enable row level security;
alter table public.size_spaces           enable row level security;
alter table public.size_pdf_catalog      enable row level security;
alter table public.admin_profiles        enable row level security;
alter table public.customer_profiles     enable row level security;
alter table public.inquiries             enable row level security;
alter table public.inquiry_items         enable row level security;
alter table public.pending_inquiries     enable row level security;
alter table public.audit_logs            enable row level security;
alter table public.collection_seo        enable row level security;
alter table public.series_seo            enable row level security;
alter table public.product_seo           enable row level security;

-- -----------------------------------------------------------------------------
-- جداول کاتالوگ عمومی: مشاهده آزاد رکوردهای فعال + مدیریت کامل توسط ادمین
-- -----------------------------------------------------------------------------
create policy "public_read_active_surface" on public.surface
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_surface" on public.surface
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_finishes" on public.finishes
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_finishes" on public.finishes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_spaces" on public.spaces
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_spaces" on public.spaces
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_collections" on public.collections
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_collections" on public.collections
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_series" on public.series
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_series" on public.series
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_products" on public.products
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_sizes" on public.sizes
  for select using (is_active = true or public.is_admin());
create policy "admin_manage_sizes" on public.sizes
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_size_technical_data" on public.size_technical_data
  for select using (true);
create policy "admin_manage_size_technical_data" on public.size_technical_data
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_size_faces" on public.size_faces
  for select using (true);
create policy "admin_manage_size_faces" on public.size_faces
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_size_media" on public.size_media
  for select using (true);
create policy "admin_manage_size_media" on public.size_media
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_size_spaces" on public.size_spaces
  for select using (true);
create policy "admin_manage_size_spaces" on public.size_spaces
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_size_pdf_catalog" on public.size_pdf_catalog
  for select using (true);
create policy "admin_manage_size_pdf_catalog" on public.size_pdf_catalog
  for all using (public.is_admin()) with check (public.is_admin());

-- SEO tables: خواندن عمومی (برای SSR/Metadata)، نوشتن فقط ادمین
create policy "public_read_collection_seo" on public.collection_seo
  for select using (true);
create policy "admin_manage_collection_seo" on public.collection_seo
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_series_seo" on public.series_seo
  for select using (true);
create policy "admin_manage_series_seo" on public.series_seo
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public_read_product_seo" on public.product_seo
  for select using (true);
create policy "admin_manage_product_seo" on public.product_seo
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- admin_profiles: هر ادمین فقط پروفایل خودش را می‌بیند/ویرایش می‌کند
-- super_admin به همه دسترسی کامل دارد. INSERT هرگز از کلاینت مجاز نیست
-- (فقط از طریق Service Role در لایه سرور برای جلوگیری از Privilege Escalation)
-- -----------------------------------------------------------------------------
create policy "admin_read_self_or_super" on public.admin_profiles
  for select using (id = auth.uid() or public.get_admin_role() = 'super_admin');

create policy "admin_update_self_or_super" on public.admin_profiles
  for update using (id = auth.uid() or public.get_admin_role() = 'super_admin')
  with check (id = auth.uid() or public.get_admin_role() = 'super_admin');

-- عمداً هیچ INSERT/DELETE Policy برای کلاینت تعریف نشده (Least Privilege).

-- -----------------------------------------------------------------------------
-- customer_profiles: هر مشتری فقط پروفایل خودش، ادمین‌ها همه را می‌بینند
-- -----------------------------------------------------------------------------
create policy "customer_read_self" on public.customer_profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "customer_update_self" on public.customer_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "admin_read_all_customers" on public.customer_profiles
  for select using (public.is_admin());

-- -----------------------------------------------------------------------------
-- inquiries: مشتری فقط استعلام‌های خودش، ادمین همه (بر اساس Sales/Super role)
-- -----------------------------------------------------------------------------
create policy "customer_read_own_inquiries" on public.inquiries
  for select using (customer_id = auth.uid() or public.is_admin());

create policy "customer_create_own_inquiry" on public.inquiries
  for insert with check (customer_id = auth.uid());

create policy "admin_update_inquiries" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- inquiry_items: پیروی از مالکیت inquiry والد
-- -----------------------------------------------------------------------------
create policy "read_inquiry_items_by_owner_or_admin" on public.inquiry_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.inquiries i
      where i.id = inquiry_items.inquiry_id and i.customer_id = auth.uid()
    )
  );

create policy "insert_inquiry_items_by_owner" on public.inquiry_items
  for insert with check (
    exists (
      select 1 from public.inquiries i
      where i.id = inquiry_items.inquiry_id and i.customer_id = auth.uid()
    )
  );

create policy "admin_manage_inquiry_items" on public.inquiry_items
  for all using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- pending_inquiries: هرگز مستقیماً از کلاینت (anon/authenticated) در دسترس نیست.
-- شامل otp_code_hash است؛ تمام دسترسی‌ها فقط از طریق Server Actions با
-- service_role (که RLS را دور می‌زند) انجام می‌شود.
-- -----------------------------------------------------------------------------
-- عمداً هیچ Policyـی تعریف نمی‌شود => انکار پیش‌فرض کامل برای anon/authenticated.

-- -----------------------------------------------------------------------------
-- audit_logs: غیرقابل‌تغییر. فقط super_admin می‌خواند، فقط سرور می‌نویسد.
-- -----------------------------------------------------------------------------
create policy "super_admin_read_audit_logs" on public.audit_logs
  for select using (public.get_admin_role() = 'super_admin');

-- عمداً هیچ INSERT/UPDATE/DELETE Policy برای کلاینت وجود ندارد (فقط service_role).
