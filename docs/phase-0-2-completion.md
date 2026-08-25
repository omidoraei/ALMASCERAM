# گزارش تکمیل مراحل صفر تا دو

## مرحله صفر — قرارداد و ساختار

- TypeScript با `strict=true` و naming مرزی تثبیت شد: camelCase در Application و snake_case فقط در mapper دیتابیس.
- پوشه‌های Supabase، actions، services، utils، migrations، scripts و مستندات معماری فعال‌اند.
- `.env.local.example` فقط کلیدهای public را برای مرورگر و service-role را برای runtimeهای مورد اعتماد تفکیک می‌کند.
- `.gitignore` شامل dependency، build output، environment، cache و فایل‌های Vercel/Supabase محلی است.

## مرحله یک — زیرساخت داده

- ۹ Migration ترتیبی برای Enum، Catalog، Identity/Inquiry/SEO، Functions/Triggers، RLS، RPC استعلام، Hardening استعلام، Storage و Trigger پروفایل وجود دارد.
- تمام ۲۱ جدول دامنه دارای RLS هستند.
- `pending_inquiries` در MVP بدون Policy و بدون privilege برای anon/authenticated است.
- سه Bucket عمومی با public-read و admin-only write فعال‌اند.
- سبد مهمان تا قبل از OTP فقط در localStorage است؛ پس از OTP با یک RPC اتمیک منتقل می‌شود.
- Server/browser/admin Supabase clients مرزهای جدا دارند و service-role وارد bundle مرورگر نمی‌شود.
- Seed و Health Check مستقل و بدون ORM هستند.

## مرحله دو — Application Actions

### Collections

- `listCollections`, `createCollection`, `updateCollection`, `deleteCollection`
- پوشش name, slug, description, cover image, publish state/order/time

### Series

- `listSeries`, `createSeries`, `updateSeries`, `deleteSeries`
- FK اجباری collection و فیلتر اختیاری والد

### Products

- `listProducts`, `createProduct`, `updateProduct`, `deleteProduct`
- پوشش series, surface, finish, SKU, color, featured/published و search trigger

### Sizes

- `listSizes`, `createSize`, `updateSize`, `deleteSize`
- پوشش ابعاد میلی‌متر، ضخامت، rectified، بسته‌بندی، وزن، وضعیت و ترتیب

## Gateهای امنیت و کیفیت

1. ورودی هر Action پیش از Query با Zod parse می‌شود.
2. UUID، slug، محدودیت عددی، nullable و حداقل یک فیلد update کنترل می‌شوند.
3. Actionها فقط anon key/session دارند؛ مجوز نهایی Mutation توسط RLS تعیین می‌شود.
4. خطاهای unique، FK و RLS به پیام کنترل‌شده تبدیل می‌شوند و متن داخلی DB افشا نمی‌شود.
5. FKهای `RESTRICT` حذف والد دارای فرزند را متوقف می‌کنند؛ cascade فقط در روابط صریح سایز اعمال می‌شود.
6. Build و Lint باید پیش از هر Deploy موفق باشند.
