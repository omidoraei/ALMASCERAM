-- =============================================================================
-- Migration 07: Security & Utility Functions
-- لایه: 7 | توابع: is_admin, get_admin_role, is_customer, set_updated_at,
--                  update_product_search_vector, handle_new_customer
-- تمام توابع SECURITY DEFINER دارای search_path ثابت برای جلوگیری از
-- Privilege Escalation (طبق اصل Security by Design) هستند.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- is_admin(): آیا کاربر جاری یک ادمین فعال است؟ (برای استفاده داخل RLS)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where id = auth.uid() and is_active = true
  );
$$;
comment on function public.is_admin() is 'بررسی می‌کند کاربر جاری ادمین فعال است یا خیر (برای RLS)';

-- -----------------------------------------------------------------------------
-- get_admin_role(): نقش ادمین جاری را برمی‌گرداند
-- -----------------------------------------------------------------------------
create or replace function public.get_admin_role()
returns admin_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles
  where id = auth.uid() and is_active = true;
$$;
comment on function public.get_admin_role() is 'نقش ادمین جاری (Least Privilege) را برمی‌گرداند';

-- -----------------------------------------------------------------------------
-- is_customer(): آیا کاربر جاری یک مشتری احرازهویت‌شده است؟
-- -----------------------------------------------------------------------------
create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.customer_profiles where id = auth.uid()
  );
$$;
comment on function public.is_customer() is 'بررسی می‌کند کاربر جاری مشتری احرازهویت‌شده است یا خیر';

-- -----------------------------------------------------------------------------
-- set_updated_at(): تریگر عمومی برای بروزرسانی خودکار ستون updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
comment on function public.set_updated_at() is 'تریگر عمومی: به‌روزرسانی خودکار ستون updated_at در هر UPDATE';

-- -----------------------------------------------------------------------------
-- update_product_search_vector(): ساخت خودکار tsvector برای جست‌وجوی محصول
-- توجه: از پیکربندی 'simple' استفاده می‌شود چون PostgreSQL دیکشنری بومی فارسی
-- ندارد؛ نرمال‌سازی نویسه‌ها با unaccent انجام می‌شود.
-- -----------------------------------------------------------------------------
create or replace function public.update_product_search_vector()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.name_fa, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.name_en, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.sku_prefix, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.description, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.color_family, ''))), 'D');
  return new;
end;
$$;
comment on function public.update_product_search_vector() is 'ساخت خودکار بردار جست‌وجوی متنی برای جدول products';

-- -----------------------------------------------------------------------------
-- handle_new_customer(): ساخت خودکار customer_profiles بعد از ثبت‌نام در auth.users
-- فقط زمانی اجرا می‌شود که متادیتای کاربر role برابر با 'customer' باشد یا
-- تعیین نشده باشد (کاربران ادمین به‌صورت دستی و امن توسط سرویس بک‌آفیس ساخته می‌شوند)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.raw_user_meta_data ->> 'role') is null
     or (new.raw_user_meta_data ->> 'role') = 'customer' then
    insert into public.customer_profiles (id, full_name, phone, customer_type)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data ->> 'phone',
      coalesce((new.raw_user_meta_data ->> 'customer_type')::customer_type, 'individual')
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
comment on function public.handle_new_customer() is 'ایجاد خودکار پروفایل مشتری پس از تایید OTP و ساخت کاربر در auth.users';
