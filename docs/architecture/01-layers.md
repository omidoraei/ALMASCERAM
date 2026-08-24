# معماری ۱۲ لایه‌ای پروژه

| # | لایه | توضیح | وضعیت |
|---|------|-------|--------|
| 1 | Requirements & Domain Modeling | تحلیل نیاز، تعریف Enum/Entity | ✅ تکمیل |
| 2 | UX Research & Information Architecture | نقشه سایت، جریان کاربر (Guest → Cart → OTP → Inquiry) | ✅ تکمیل |
| 3 | Visual Design System | تم Modern Industrial، برنز مات #8B7355، فونت Vazirmatn | ✅ تکمیل |
| 4 | Design Tokens & Theming | `@theme` در Tailwind v4 (`globals.css`) | ✅ تکمیل |
| 5 | Component Architecture | shadcn/ui + Radix، جداسازی `ui/`, `layout/`, `public/`, `admin/` | ✅ تکمیل |
| 6 | Routing & Navigation | App Router، گروه‌های `(public)` و `(admin)` | ✅ تکمیل |
| 7 | Backend Infrastructure | Supabase Schema، Migrations، RLS، Clients، Middleware | ✅ تکمیل (این مرحله) |
| 8.1 | Validation Layer | Zod Schemas برای تمام ورودی‌ها | ✅ تکمیل |
| 8.2 | Service & Server Actions Layer | CRUD کامل Collections/Series/Products/Sizes + Inquiry/Auth Actions | ✅ تکمیل (این مرحله) |
| 8.3 | Client State Layer | Zustand (فقط سبد استعلام پایدار) | ✅ تکمیل |
| 9 | Admin Panel (پنل مدیریت کامل) | مدیریت محتوا، استعلام‌ها، گزارش‌گیری، Audit Viewer | ⏳ **در انتظار تأیید کارفرما** |
| 10 | Public-Facing Experience | صفحات کاتالوگ، جستجو، سبد استعلام، حساب کاربری | ✅ تکمیل (نسخه اول) |
| 11 | Testing & QA | تست واحد/E2E روی Server Actions و RLS | 🔜 آینده |
| 12 | Observability & Deployment | Audit Logs، Vercel Analytics، مانیتورینگ خطا | 🔜 آینده (پایه Audit Log آماده است) |

> طبق دستور کارفرما، لایه ۹ (پنل مدیریت کامل) صرفاً پس از تأیید صریح آغاز می‌شود.
> در نسخه فعلی فقط زیرساخت امنیتی (Login، Middleware Guard، Dashboard Shell)
> پیاده‌سازی شده است.
