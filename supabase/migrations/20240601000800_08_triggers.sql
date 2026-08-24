-- =============================================================================
-- Migration 08: Triggers
-- لایه: 7 | اتصال توابع Migration قبلی به رخدادهای جداول
-- =============================================================================

-- -----------------------------------------------------------------------------
-- تریگرهای updated_at روی تمام جداول دارای این ستون
-- -----------------------------------------------------------------------------
create trigger trg_surface_updated_at before update on public.surface
  for each row execute function public.set_updated_at();

create trigger trg_finishes_updated_at before update on public.finishes
  for each row execute function public.set_updated_at();

create trigger trg_spaces_updated_at before update on public.spaces
  for each row execute function public.set_updated_at();

create trigger trg_collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();

create trigger trg_series_updated_at before update on public.series
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_sizes_updated_at before update on public.sizes
  for each row execute function public.set_updated_at();

create trigger trg_size_technical_data_updated_at before update on public.size_technical_data
  for each row execute function public.set_updated_at();

create trigger trg_admin_profiles_updated_at before update on public.admin_profiles
  for each row execute function public.set_updated_at();

create trigger trg_customer_profiles_updated_at before update on public.customer_profiles
  for each row execute function public.set_updated_at();

create trigger trg_inquiries_updated_at before update on public.inquiries
  for each row execute function public.set_updated_at();

create trigger trg_collection_seo_updated_at before update on public.collection_seo
  for each row execute function public.set_updated_at();

create trigger trg_series_seo_updated_at before update on public.series_seo
  for each row execute function public.set_updated_at();

create trigger trg_product_seo_updated_at before update on public.product_seo
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- تریگر ساخت خودکار search_vector محصول
-- -----------------------------------------------------------------------------
create trigger trg_products_search_vector
  before insert or update of name_fa, name_en, sku_prefix, description, color_family
  on public.products
  for each row execute function public.update_product_search_vector();

-- -----------------------------------------------------------------------------
-- تریگر ساخت خودکار پروفایل مشتری پس از ثبت‌نام در Supabase Auth
-- -----------------------------------------------------------------------------
create trigger on_auth_user_created_customer
  after insert on auth.users
  for each row execute function public.handle_new_customer();
