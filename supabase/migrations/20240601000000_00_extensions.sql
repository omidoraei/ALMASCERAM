-- =============================================================================
-- Migration 00: Extensions
-- لایه: 7 (زیرساخت بک‌اند) | نسخه: نهایی
-- هدف: فعال‌سازی افزونه‌های موردنیاز PostgreSQL روی Supabase
-- =============================================================================

-- تولید UUID
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- جست‌وجوی متنی بدون تلفظ (بدون حساسیت به i/ي، ک/ك و ...) برای فارسی
create extension if not exists unaccent with schema extensions;

-- فهرست‌های ترکیبی برای ستون‌های چندگانه (مثلاً جست‌وجوی سایز + فیلتر)
create extension if not exists btree_gin with schema extensions;
