-- =============================================================================
-- Migration 03: Products & Sizes (هسته اصلی کاتالوگ فنی)
-- لایه: 7 | جداول: products, sizes, size_technical_data, size_faces,
--                  size_media, size_spaces, size_pdf_catalog
-- نکته حیاتی دامنه کسب‌وکار: قیمت هرگز در این جداول ذخیره نمی‌شود.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- products: طرح مشخص داخل یک سری (بدون قیمت، بدون موجودی عمومی)
-- -----------------------------------------------------------------------------
create table public.products (
  id               uuid primary key default gen_random_uuid(),
  series_id        uuid not null references public.series(id) on delete cascade,
  surface_id       uuid references public.surface(id) on delete set null,
  finish_id        uuid references public.finishes(id) on delete set null,
  name_fa          text not null,
  name_en          text not null,
  slug             text not null unique,
  sku_prefix       text not null unique,
  description      text,
  application_type application_type not null default 'floor_and_wall',
  color_family     text,
  design_pattern   text,
  cover_image_url  text,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  view_count       integer not null default 0,
  search_vector    tsvector,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.products is 'محصول: یک طرح/رنگ مشخص داخل یک سری. هرگز قیمت ندارد.';

create index idx_products_series_id on public.products(series_id);
create index idx_products_surface_id on public.products(surface_id);
create index idx_products_finish_id on public.products(finish_id);
create index idx_products_search_vector on public.products using gin(search_vector);
create index idx_products_is_active on public.products(is_active) where is_active = true;

-- -----------------------------------------------------------------------------
-- sizes: سایزهای فیزیکی موجود برای هر محصول (کانون دقت فنی پروژه)
-- -----------------------------------------------------------------------------
create table public.sizes (
  id                          uuid primary key default gen_random_uuid(),
  product_id                  uuid not null references public.products(id) on delete cascade,
  size_label                  text not null,               -- مثال: '60x120'
  width_mm                    numeric(8,2) not null check (width_mm > 0),
  height_mm                   numeric(8,2) not null check (height_mm > 0),
  thickness_mm                numeric(6,2) not null check (thickness_mm > 0),
  is_rectified                boolean not null default true,
  packaging_pieces_per_box    integer not null check (packaging_pieces_per_box > 0),
  packaging_boxes_per_pallet  integer not null check (packaging_boxes_per_pallet > 0),
  packaging_m2_per_box        numeric(8,4) not null check (packaging_m2_per_box > 0),
  packaging_weight_per_box_kg numeric(8,2) not null check (packaging_weight_per_box_kg > 0),
  is_active                   boolean not null default true,
  sort_order                  integer not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  unique (product_id, size_label)
);
comment on table public.sizes is 'سایزهای فیزیکی هر محصول همراه با اطلاعات دقیق بسته‌بندی';

create index idx_sizes_product_id on public.sizes(product_id);

-- -----------------------------------------------------------------------------
-- size_technical_data: مشخصات فنی استاندارد (یک‌به‌یک با sizes طبق ISO 13006)
-- -----------------------------------------------------------------------------
create table public.size_technical_data (
  id                        uuid primary key default gen_random_uuid(),
  size_id                   uuid not null unique references public.sizes(id) on delete cascade,
  pei_rating                smallint check (pei_rating between 0 and 5),
  water_absorption_percent  numeric(5,2),
  breaking_strength_n       numeric(8,2),
  mohs_hardness             numeric(3,1) check (mohs_hardness between 0 and 10),
  slip_resistance_r_rating  text,
  frost_resistant           boolean not null default false,
  chemical_resistance       text,
  standard_reference        text not null default 'ISO 13006',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
comment on table public.size_technical_data is 'مشخصات فنی استاندارد هر سایز طبق استاندارد بین‌المللی ISO 13006';

-- -----------------------------------------------------------------------------
-- size_faces: چهره‌های چاپی مختلف یک سایز (برای جلوگیری از افکت تکرار الگو)
-- -----------------------------------------------------------------------------
create table public.size_faces (
  id          uuid primary key default gen_random_uuid(),
  size_id     uuid not null references public.sizes(id) on delete cascade,
  face_number smallint not null check (face_number > 0),
  image_url   text not null,
  created_at  timestamptz not null default now(),
  unique (size_id, face_number)
);
comment on table public.size_faces is 'چهره‌های مختلف چاپ برای هر سایز (Face 1..N)';

-- -----------------------------------------------------------------------------
-- size_media: گالری رسانه (تصویر/ویدیو/۳۶۰) هر سایز
-- -----------------------------------------------------------------------------
create table public.size_media (
  id         uuid primary key default gen_random_uuid(),
  size_id    uuid not null references public.sizes(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'panorama_360')),
  url        text not null,
  alt_text   text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.size_media is 'گالری رسانه‌ای اختصاصی هر سایز (تصویر، ویدیو، پانوراما)';

create index idx_size_media_size_id on public.size_media(size_id);

-- -----------------------------------------------------------------------------
-- size_spaces: رابطه چند‌به‌چند سایز <-> فضای پیشنهادی
-- -----------------------------------------------------------------------------
create table public.size_spaces (
  size_id  uuid not null references public.sizes(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  primary key (size_id, space_id)
);
comment on table public.size_spaces is 'رابطه چند‌به‌چند بین سایز محصول و فضاهای پیشنهادی کاربرد';

-- -----------------------------------------------------------------------------
-- size_pdf_catalog: فایل‌های PDF کاتالوگ فنی/رسمی هر سایز
-- -----------------------------------------------------------------------------
create table public.size_pdf_catalog (
  id            uuid primary key default gen_random_uuid(),
  size_id       uuid not null references public.sizes(id) on delete cascade,
  title         text not null,
  file_url      text not null,
  file_size_kb  integer,
  created_at    timestamptz not null default now()
);
comment on table public.size_pdf_catalog is 'کاتالوگ‌های PDF فنی/رسمی مرتبط با هر سایز';
