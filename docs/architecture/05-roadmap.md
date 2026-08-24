# نقشه راه توسعه

## ✅ مرحله صفر — زیرساخت پروژه
- اسکلت Next.js 15 + TypeScript Strict + Tailwind v4
- `.env.local.example`, `.gitignore` استاندارد
- ساختار پوشه‌بندی کامل طبق سند

## ✅ مرحله ۱ — زیرساخت بک‌اند (لایه ۷)
- ۱۱ فایل Migration مرتب و کامنت‌گذاری‌شده (Enums → Tables → Functions → Triggers → RLS → Indexes)
- کلاینت‌های Supabase (`server.ts`, `client.ts`, `admin.ts`)
- Middleware حفاظت از `/admin` و `/account`
- اسکریپت‌های `seed.ts` و `health-check.ts`

## ✅ مرحله ۲ — Server Actions و Service Layer (لایه ۸.۱ و ۸.۲)
- CRUD کامل Collections, Series, Products, Sizes با Zod + Audit Log
- Service Layer با Fallback داده نمایشی برای دمو بدون بک‌اند واقعی
- سیستم کامل Inquiry Cart + Email OTP (Zustand + Server Actions)

## ⏳ مرحله ۳ — پنل مدیریت کامل (لایه ۹) — در انتظار تأیید
- UI کامل مدیریت محتوا (جدول‌ها، فرم‌ها، آپلود تصویر به Supabase Storage)
- مدیریت استعلام‌ها (تغییر وضعیت، یادداشت ادمین، پاسخ به مشتری)
- گزارش‌گیری و نمایش Audit Log برای super_admin
- مدیریت نقش‌های ادمین (فقط توسط super_admin)

## 🔜 مراحل آینده
- تست‌های E2E (Playwright) روی جریان OTP و RLS
- اتصال Supabase Storage برای آپلود تصاویر واقعی
- گزارش‌های تحلیلی (بازدید محصول، نرخ تبدیل استعلام)
