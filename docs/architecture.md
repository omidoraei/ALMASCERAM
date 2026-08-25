# سند معماری — پلتفرم کاتالوگ کاشی و سرامیک کارا

## Architecture Decision Record

**وضعیت:** Accepted — 2025-02  
**هدف:** کاتالوگ B2B/B2C بدون قیمت عمومی و پرداخت، با تبدیل کاربر به لید از طریق استعلام چندمحصولی و Email Magic Link.

## لایه‌بندی ۱۲ لایه‌ای

1. **Experience:** زبان فارسی، RTL، mobile-first، دسترس‌پذیری و Modern Industrial.
2. **Routing & Rendering:** مرزبندی public/admin/account؛ صفحات محتوایی قابل SSR/ISR و پنل خصوصی پویا.
3. **UI Primitives:** توکن‌های رنگ، تایپوگرافی Vazirmatn، کامپوننت‌های اتمی مبتنی بر Radix.
4. **Feature Components:** Catalog, Product Detail, Technical Size Matrix, Persistent Inquiry.
5. **Client State:** فقط وضعیت گذرا و سبد استعلام در Zustand؛ داده اصلی از سرور.
6. **Validation & Forms:** قرارداد واحد Zod در مرز ورودی؛ React Hook Form برای فرم‌ها.
7. **Backend Infrastructure:** Supabase Auth/PostgreSQL/Storage/RPC با RLS پیش‌فرض؛ بدون Edge Function در مسیر استعلام MVP.
8. **Application Use Cases:** Query catalog، CRUD ادمین، Email Magic Link مستقیم و یک RPC اتمیک برای submit inquiry.
9. **Administration:** در فاز بعد؛ نقش‌محور و فاقد دسترسی مستقیم service-role در مرورگر.
10. **Data & Search:** PostgreSQL، نام‌گذاری snake_case، FTS فارسی با trigger و index.
11. **Security & Observability:** least privilege، audit log append-only، redaction و correlation id.
12. **Delivery & Operations:** typecheck/build، migration ترتیبی، health check و استقرار اتمیک.

## HARNESS

- **H — Hard boundaries:** مرز public/admin و server/client غیرقابل عبور است.
- **A — Architecture records:** تصمیم‌های امنیتی و داده‌ای پیش از کد ثبت می‌شوند.
- **R — Requirements & risks:** نبود قیمت عمومی، Magic Link و مالکیت inquiry معیار پذیرش هستند.
- **N — Non-functional gates:** RTL، SEO، strict TS، performance و accessibility gate دارند.
- **E — Evidence:** build، migration، RLS و health-check شواهد تحویل‌اند.
- **S — Security:** deny-by-default، validation دوباره در سرور و service-role فقط server-side.
- **S — Sustainability:** ماژول‌های کوچک، قرارداد مشخص و migration برگشت‌پذیر.

## FINN-Loop

1. **Frame:** دامنه و معیار پذیرش کوچک تعریف می‌شود.
2. **Implement:** کمترین vertical slice کامل ساخته می‌شود.
3. **Normalize:** قرارداد، naming، validation و policy یکدست می‌شوند.
4. **Navigate:** خروجی با build/security check سنجیده و iteration بعد انتخاب می‌شود.

## مرزهای امنیتی

- کلاینت عمومی فقط anon key دارد؛ service-role هرگز با prefix عمومی تعریف نمی‌شود.
- داده‌های catalog منتشرشده برای anonymous خواندنی است. تمام mutationها نیازمند admin profile فعال‌اند.
- سبد مهمان تا قبل از بازگشت موفق Magic Link فقط در `localStorage` نگهداری می‌شود و هیچ داده مهمانی به دیتابیس ارسال نمی‌شود.
- `pending_inquiries` در MVP استفاده نمی‌شود، هیچ policy برای هیچ command ندارد و privilege آن از `anon` و `authenticated` سلب شده است.
- پس از Email Magic Link، کل سبد با یک فراخوانی مستقیم `create_inquiry_from_basket(items, note)` به PostgreSQL منتقل می‌شود؛ Edge Function و serverless hop وجود ندارد.
- RPC از نوع `SECURITY INVOKER` است، `auth.uid()` و `customer_profiles` را بررسی می‌کند، RLS را حفظ می‌کند و درج inquiry/items را در یک تراکنش انجام می‌دهد.
- inquiry ثبت‌شده فقط توسط مالک متناظر در `customer_profiles` یا admin دیده می‌شود؛ audit log برای کاربر عمومی بسته است.
- Magic Link باید rate limit، expiry، single-use PKCE code و پاسخ‌های غیرقابل تشخیص برای جلوگیری از account enumeration داشته باشد.
- رسانه‌های MVP در سه Bucket عمومی تفکیک‌شده نگهداری می‌شوند؛ نمایش از CDN بدون Signed URL انجام می‌شود و write فقط با Storage RLS و `is_admin()` مجاز است.

## ADR-002 — Guest Basket to Authenticated Inquiry

1. کاربر مهمان محصولات و سایزها را در Store پایدار مرورگر جمع می‌کند.
2. فرم با Zod اعتبارسنجی و Magic Link مستقیماً از Supabase Auth درخواست می‌شود.
3. callback کد PKCE را با session احرازشده مبادله می‌کند.
4. Action فقط یک بار RPC را با آرایه حداکثر ۵۰ قلم فراخوانی می‌کند.
5. PostgreSQL هویت، مالکیت profile، UUID سایزها، انتشار محصول، quantity، متراژ، تکراری‌نبودن و طول note را دوباره بررسی می‌کند.
6. هر خطا کل statement را Rollback می‌کند. Store مرورگر فقط بعد از دریافت UUID استعلام پاک می‌شود.

## ADR-005 — Public Catalog Storage

1. `catalog-media` برای تصویر، فیس، تکسچر و ویدئو؛ `catalog-documents` برای PDF؛ `seo-media` برای OpenGraph استفاده می‌شود.
2. هر سه Bucket در MVP `public=true` هستند و نمایش فایل هیچ Serverless/Edge/Signed URL نیاز ندارد.
3. `anon` و `authenticated` فقط SELECT دارند؛ INSERT/UPDATE/DELETE با `public.is_admin()` محدود می‌شود.
4. Action آپلود MIME، حجم، path و پسوند را با allow-list کنترل می‌کند و نام نهایی را UUID می‌سازد.
5. فایل‌های محرمانه یا پیش‌نویس آینده باید در Bucket خصوصی مستقل قرار گیرند؛ چنین Bucketی در MVP ساخته نمی‌شود.

## SEO

مسیرهای collection/series/product در لایه rendering با canonical، JSON-LD، OpenGraph و sitemap تولید می‌شوند. metadata از جداول نهایی `collection_seo`، `series_seo` و `product_seo` خوانده می‌شود. صفحه فهرست ISR و جزئیات محصول SSR/ISR ترکیبی است؛ صفحات account/admin ایندکس نمی‌شوند.
