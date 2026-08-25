# Canonical Migration History

## Audit result

در snapshot فعلی فقط سری `20250201*` در `supabase/migrations/` وجود دارد. هیچ فایل `20240601*` برای انتقال یا قرنطینه پیدا نشد؛ بنابراین حذف یا جابه‌جایی فرضی انجام نشد.

## Canonical series

سری `20250201*` canonical است، چون schema فعلی، RLS سخت‌سازی‌شده، RPC `create_inquiry_from_basket`، Storage buckets، Magic Link profile trigger و Soft Delete را پوشش می‌دهد.

## Fresh database

برای DB تازه:

```bash
supabase db reset
```

باید Migrationها را به ترتیب timestamp اجرا کند. اجرای واقعی این دستور به Supabase CLI و Docker محلی نیاز دارد.

## Existing legacy database

اگر محیط دیگری خارج از این repository با سری `20240601*` ساخته شده است، فایل‌های آن نباید با سری canonical ادغام شوند. مسیر امن یکی از این دو است:

1. ایجاد Supabase Project جدید و اجرای سری canonical؛ یا
2. تهیه backup، reset کامل و restore داده‌ای کنترل‌شده بدون restore کردن schema قدیمی.

اجرای هم‌زمان دو سری شامل `CREATE TYPE`های تکراری مجاز نیست.
