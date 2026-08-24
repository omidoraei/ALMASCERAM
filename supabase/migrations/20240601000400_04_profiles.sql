-- =============================================================================
-- Migration 04: Profiles (Admin & Customer)
-- لایه: 7 | جداول: admin_profiles, customer_profiles
-- هر دو جدول با id به auth.users متصل هستند (۱ به ۱ با کاربران Supabase Auth)
-- =============================================================================

create table public.admin_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  role       admin_role not null default 'viewer',
  phone      text,
  avatar_url text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.admin_profiles is 'پروفایل کاربران پنل مدیریت با سطح دسترسی مشخص (Least Privilege)';

create table public.customer_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  phone         text,
  customer_type customer_type not null default 'individual',
  company_name  text,
  province      text,
  city          text,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.customer_profiles is 'پروفایل مشتریان احراز هویت‌شده از طریق Email OTP';
