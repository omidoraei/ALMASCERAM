# ADR-005 — سیاست Storage در MVP

## تصمیم

همه دارایی‌های کاتالوگ MVP عمومی هستند. هدف حذف هزینه و پیچیدگی Signed URL، Serverless و Edge Function از مسیر نمایش رسانه است. عمومی بودن فایل به معنی عمومی بودن write نیست؛ تمام writeها توسط RLS و `is_admin()` محافظت می‌شوند.

## Bucketها

| Bucket | Public | سقف فایل | MIME Types | کاربرد |
|---|---:|---:|---|---|
| `catalog-media` | بله | ۵۰MB | JPEG, PNG, WebP, AVIF, MP4 | فیس‌ها، تکسچر، تصویر و ویدئوی محصول |
| `catalog-documents` | بله | ۲۵MB | PDF | کاتالوگ PDF سایزها |
| `seo-media` | بله | ۸MB | JPEG, PNG, WebP, AVIF | OpenGraph و تصاویر SEO |

## ماتریس دسترسی `storage.objects`

| Operation | نقش | شرط |
|---|---|---|
| SELECT | `anon`, `authenticated` | `bucket_id` یکی از سه Bucket عمومی باشد |
| INSERT | `authenticated` Admin | Bucket مجاز و `is_admin()` |
| UPDATE | `authenticated` Admin | `USING` و `WITH CHECK`: Bucket مجاز و `is_admin()` |
| DELETE | `authenticated` Admin | Bucket مجاز و `is_admin()` |

Bucketها با `public=true` ساخته می‌شوند، پس URL مستقیم CDN بدون بررسی RLS قابل خواندن است؛ این رفتار عمدی و بخشی از قرارداد MVP است. Policy SELECT برای عملیات Storage API مثل list/download اضافه شده است.

## قرارداد Path

- `catalog-media/products/{product_uuid}/...`
- `catalog-media/sizes/{size_uuid}/faces/...`
- `catalog-documents/sizes/{size_uuid}/...`
- `seo-media/{entity}/{entity_uuid}/...`
- نام فایل سمت کلاینت پذیرفته نمی‌شود؛ Action یک UUID و پسوند استخراج‌شده از MIME معتبر می‌سازد.
- `..`، مسیر تکراری و کاراکترهای خارج از allow-list رد می‌شوند.

## فاز آینده

اگر پیش‌نویس، قرارداد محرمانه، خروجی قیمت یا فایل داخلی اضافه شد، باید Bucket جداگانه‌ای مانند `catalog-private-drafts` با `public=false` ساخته شود. آن Bucket نباید Policy عمومی داشته باشد و دسترسی آن باید با session مالک/Admin یا Signed URL کوتاه‌عمر انجام شود. Bucket خصوصی در MVP ایجاد نمی‌شود.
