-- =============================================================================
-- Migration 06: Audit Logs & SEO Tables
-- لایه: 7 | جداول: audit_logs, collection_seo, series_seo, product_seo
-- نکته مهم SEO: این نسخه از جداول SEO، نسخه نهایی و تایید شده پروژه است.
-- =============================================================================

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_role  text,
  action      text not null,          -- مثال: 'product.create', 'inquiry.status_change'
  entity_type text not null,          -- مثال: 'product', 'inquiry'
  entity_id   uuid,
  level       audit_log_level not null default 'info',
  metadata    jsonb not null default '{}'::jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
comment on table public.audit_logs is 'ثبت غیرقابل‌تغییر (Immutable) رخدادهای امنیتی و عملیاتی سیستم';

create index idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- -----------------------------------------------------------------------------
-- SEO Tables (نسخه نهایی) — هر جدول یک‌به‌یک با موجودیت اصلی خود
-- -----------------------------------------------------------------------------
create table public.collection_seo (
  id               uuid primary key default gen_random_uuid(),
  collection_id    uuid not null unique references public.collections(id) on delete cascade,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  canonical_url    text,
  keywords         text[] not null default '{}',
  schema_markup    jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.collection_seo is 'نسخه نهایی SEO اختصاصی برای صفحه هر کالکشن';

create table public.series_seo (
  id               uuid primary key default gen_random_uuid(),
  series_id        uuid not null unique references public.series(id) on delete cascade,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  canonical_url    text,
  keywords         text[] not null default '{}',
  schema_markup    jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.series_seo is 'نسخه نهایی SEO اختصاصی برای صفحه هر سری';

create table public.product_seo (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null unique references public.products(id) on delete cascade,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  canonical_url    text,
  keywords         text[] not null default '{}',
  schema_markup    jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.product_seo is 'نسخه نهایی SEO اختصاصی برای صفحه هر محصول (مهم‌ترین جدول برای SEO فنی)';
