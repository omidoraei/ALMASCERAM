# متدولوژی HARNESS و چرخه FINN-Loop

## HARNESS (اصول حاکم بر هر تغییر)
- **H**old the domain truth: قبل از هر کد، مدل داده باید تثبیت شود (این سند).
- **A**rchitect before Act: هیچ کدی بدون طراحی معماری لایه مربوطه نوشته نمی‌شود.
- **R**LS-first: هر جدول جدید همزمان با تعریف، سیاست RLS خود را دریافت می‌کند.
- **N**o ORM: تمام دسترسی به داده از طریق Supabase JS Client خام و تایپ‌شده.
- **E**xplicit Validation: هیچ ورودی بدون Zod schema پردازش نمی‌شود.
- **S**erver Actions Only for Mutation: کلاینت هرگز مستقیم insert/update/delete
  نمی‌زند مگر از طریق Server Action یا RLS محدودشده.
- **S**ecurity Defense-in-Depth: RLS + بررسی نقش در Server Action + Middleware.

## چرخه FINN-Loop (برای هر Feature)
1. **F**ormalize: تعریف دقیق ورودی/خروجی و Zod Schema
2. **I**mplement: پیاده‌سازی Migration → Service → Server Action → UI
3. **N**ormalize: بازبینی نام‌گذاری (snake_case دیتابیس / camelCase کد)
4. **N**otarize: مستندسازی در `docs/architecture` + کامنت‌گذاری در Migration

این چرخه برای Collections، Series، Products و Sizes در مرحله ۲ به‌طور کامل
طی شده است.
