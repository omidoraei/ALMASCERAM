-- =============================================================================
-- Migration 01: Enum Types
-- لایه: 7 (زیرساخت بک‌اند) | نسخه: نهایی و منبع حقیقت واحد (Single Source of Truth)
-- تمام مقادیر این Enumها دقیقاً همینجا تعریف و در کل پروژه (Zod / TS Types)
-- بدون تغییر بازتولید می‌شوند. هرگونه تغییر باید ابتدا اینجا انجام شود.
-- =============================================================================

-- کاربرد فنی کاشی/سرامیک روی بدنه محصول
create type application_type as enum (
  'floor',              -- کف
  'wall',               -- دیوار
  'floor_and_wall',     -- کف و دیوار (یونیورسال)
  'facade',             -- نمای ساختمان
  'pool_and_wet_areas', -- استخر و فضاهای مرطوب
  'outdoor_landscape'   -- محوطه‌سازی و فضای باز
);

-- سطوح دسترسی پنل مدیریت (Least Privilege)
create type admin_role as enum (
  'super_admin',      -- دسترسی کامل + مدیریت سایر ادمین‌ها
  'content_manager',  -- مدیریت کاتالوگ (کالکشن/سری/محصول/سایز)
  'sales_manager',    -- مدیریت استعلام‌های قیمت و مشتریان
  'viewer'            -- فقط مشاهده (گزارش‌گیری)
);

-- نوع مشتری برای شخصی‌سازی استعلام قیمت B2B/B2C
create type customer_type as enum (
  'individual',   -- مصرف‌کننده نهایی (حقیقی)
  'contractor',   -- پیمانکار اجرایی
  'architect',    -- معمار / طراح داخلی
  'retailer',     -- نماینده فروش / فروشگاه
  'wholesaler'    -- عمده‌فروش / پخش‌کننده
);

-- وضعیت گردش‌کار استعلام قیمت
create type inquiry_status as enum (
  'pending',    -- در انتظار بررسی کارشناس
  'reviewing',  -- در حال بررسی و استعلام از کارخانه
  'quoted',     -- قیمت به مشتری اعلام شد
  'completed',  -- فرآیند تکمیل شده
  'cancelled'   -- لغو شده توسط مشتری یا ادمین
);

-- سطح اهمیت رخدادهای امنیتی / عملیاتی برای Audit Trail
create type audit_log_level as enum (
  'info',
  'warning',
  'error',
  'critical'
);
