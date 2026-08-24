-- =============================================================================
-- Migration 02: Catalog Taxonomy Tables
-- لایه: 7 | جداول پایه دسته‌بندی: surface, finishes, spaces, collections, series
-- توضیح تفاوت surface و finishes:
--   surface  => نوع بدنه محصول (پرسلانی، سرامیکی، موزاییک، کوتو ...)
--   finishes => نوع پرداخت سطحی نهایی (مات، براق، لعاب‌دار، نانو، ساتن ...)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- surface: نوع بدنه محصول
-- -----------------------------------------------------------------------------
create table public.surface (
  id           uuid primary key default gen_random_uuid(),
  name_fa      text not null,
  name_en      text not null,
  slug         text not null unique,
  description  text,
  icon         text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.surface is 'نوع بدنه محصول کاشی/سرامیک (پرسلان، سرامیک، موزاییک و ...)';

-- -----------------------------------------------------------------------------
-- finishes: نوع پرداخت سطح
-- -----------------------------------------------------------------------------
create table public.finishes (
  id           uuid primary key default gen_random_uuid(),
  name_fa      text not null,
  name_en      text not null,
  slug         text not null unique,
  description  text,
  icon         text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.finishes is 'نوع پرداخت سطحی نهایی محصول (مات، براق، لعاب‌دار، نانو و ...)';

-- -----------------------------------------------------------------------------
-- spaces: فضای پیشنهادی استفاده (پذیرایی، آشپزخانه، حمام، نما، استخر ...)
-- -----------------------------------------------------------------------------
create table public.spaces (
  id           uuid primary key default gen_random_uuid(),
  name_fa      text not null,
  name_en      text not null,
  slug         text not null unique,
  icon         text,
  description  text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table public.spaces is 'فضاهای پیشنهادی برای استفاده از محصول (پذیرایی، حمام، نما و ...)';

-- -----------------------------------------------------------------------------
-- collections: بالاترین سطح دسته‌بندی محصولات (مجموعه/برند خط تولید)
-- -----------------------------------------------------------------------------
create table public.collections (
  id              uuid primary key default gen_random_uuid(),
  name_fa         text not null,
  name_en         text not null,
  slug            text not null unique,
  description     text,
  cover_image_url text,
  is_featured     boolean not null default false,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.collections is 'بالاترین سطح دسته‌بندی: مجموعه یا خط تولید محصولات';

-- -----------------------------------------------------------------------------
-- series: سری‌های داخل هر کالکشن
-- -----------------------------------------------------------------------------
create table public.series (
  id              uuid primary key default gen_random_uuid(),
  collection_id   uuid not null references public.collections(id) on delete cascade,
  name_fa         text not null,
  name_en         text not null,
  slug            text not null unique,
  description     text,
  cover_image_url text,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.series is 'سری‌های محصول داخل هر کالکشن';

create index idx_series_collection_id on public.series(collection_id);
