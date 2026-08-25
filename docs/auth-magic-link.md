# Magic Link Configuration Checklist

## Supabase Dashboard → Authentication → URL Configuration

- Site URL: دامنه production برنامه
- Redirect URLs:
  - دامنه production به‌همراه `/auth/callback`
  - آدرس preview مجاز به‌همراه `/auth/callback`
  - `http://localhost:5173/auth/callback` برای توسعه محلی

## رفتار

- Customer: `shouldCreateUser=true`
- Admin: `shouldCreateUser=false`
- Callback کد PKCE را exchange می‌کند.
- Admin فعال به `/admin` و Customer به `/account` هدایت می‌شود.
- اگر context استعلام وجود داشته باشد، callback ابتدا RPC اتمیک را اجرا می‌کند.
- Cooldown رابط کاربری ۶۰ ثانیه است؛ rate limit اصلی باید در Supabase Auth نیز تنظیم شود.
