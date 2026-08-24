-- =============================================================================
-- Migration 05: Inquiry System (قلب تپنده تبدیل لید)
-- لایه: 7 | جداول: inquiries, inquiry_items, pending_inquiries
-- pending_inquiries = سبد استعلام موقت پیش از احراز هویت OTP (Persistent Cart)
-- =============================================================================

create table public.inquiries (
  id                uuid primary key default gen_random_uuid(),
  inquiry_number    text not null unique, -- مثال: INQ-20240601-0001
  customer_id       uuid references public.customer_profiles(id) on delete set null,
  status            inquiry_status not null default 'pending',
  full_name         text not null,
  phone             text not null,
  email             text not null,
  company_name      text,
  city              text,
  message           text,
  admin_notes       text,
  assigned_admin_id uuid references public.admin_profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  responded_at      timestamptz
);
comment on table public.inquiries is 'استعلام قیمت نهایی ارسال‌شده توسط مشتری احرازهویت‌شده';

create index idx_inquiries_customer_id on public.inquiries(customer_id);
create index idx_inquiries_status on public.inquiries(status);

create table public.inquiry_items (
  id            uuid primary key default gen_random_uuid(),
  inquiry_id    uuid not null references public.inquiries(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete restrict,
  size_id       uuid not null references public.sizes(id) on delete restrict,
  quantity_box  integer not null check (quantity_box > 0),
  quantity_m2   numeric(10,2),
  note          text,
  created_at    timestamptz not null default now()
);
comment on table public.inquiry_items is 'ردیف‌های محصول/سایز داخل هر استعلام قیمت';

create index idx_inquiry_items_inquiry_id on public.inquiry_items(inquiry_id);
create index idx_inquiry_items_product_id on public.inquiry_items(product_id);

-- -----------------------------------------------------------------------------
-- pending_inquiries: سبد استعلام Persistent قبل از تایید OTP
-- شامل هش OTP است -> هرگز نباید از سمت کلاینت قابل خواندن باشد (نگاه کن به RLS)
-- -----------------------------------------------------------------------------
create table public.pending_inquiries (
  id             uuid primary key default gen_random_uuid(),
  session_token  uuid not null unique default gen_random_uuid(),
  email          text,
  items          jsonb not null default '[]'::jsonb,
  otp_code_hash  text,
  otp_expires_at timestamptz,
  otp_attempts   smallint not null default 0,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null default (now() + interval '7 days')
);
comment on table public.pending_inquiries is 'سبد استعلام موقت سمت سرور پیش از احراز هویت OTP؛ حاوی هش OTP، دسترسی فقط از طریق service role';

create index idx_pending_inquiries_session_token on public.pending_inquiries(session_token);
