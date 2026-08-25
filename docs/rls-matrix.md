# ماتریس نهایی RLS — ADR-004

## نقش‌ها و Predicateهای مشترک

- **Public:** نقش‌های `anon` و `authenticated` فقط برای محتوای منتشرشده.
- **Owner:** `customer_profiles.user_id = auth.uid()` و شناسه مالک رکورد نیز با همان user برابر باشد.
- **Admin:** `is_admin() = true`؛ یعنی `admin_profiles.user_id = auth.uid()` و `is_active = true`.
- **Super Admin:** `get_admin_role() = 'super_admin'`.
- علامت **—** یعنی هیچ Policy وجود ندارد و عملیات با deny-by-default رد می‌شود.

| جدول | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `surface` | Public: `is_active`; Admin: همه | Admin / `is_admin()` | Admin / `USING + CHECK is_admin()` | Admin / `is_admin()` |
| `finishes` | Public: `is_active`; Admin: همه | Admin | Admin | Admin |
| `spaces` | Public: `is_active`; Admin: همه | Admin | Admin | Admin |
| `collections` | Public: `is_published`; Admin: همه | Admin | Admin | Admin |
| `series` | Public: خود و collection منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `products` | Public: خود و series منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `sizes` | Public: `is_active` و product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `size_technical_data` | Public: size فعال + product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `size_faces` | Public: size فعال + product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `size_media` | Public: size فعال + product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `size_spaces` | Public: size فعال + product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `size_pdf_catalog` | Public: size فعال + product منتشرشده؛ Admin: همه | Admin | Admin | Admin |
| `admin_profiles` | خود کاربر یا Admin | فقط Super Admin / `WITH CHECK get_admin_role()` | فقط Super Admin / `USING + CHECK` | فقط Super Admin و `user_id <> auth.uid()` |
| `customer_profiles` | Owner یا Admin | فقط Trigger مورد اعتماد `handle_new_customer()` | Owner فقط رکورد خود | — |
| `inquiries` | Owner از طریق `customer_profiles` یا Admin | Owner با `status='submitted'` یا Admin؛ در MVP از RPC | فقط Admin | — |
| `inquiry_items` | Owner والد یا Admin | Owner والد یا Admin؛ در MVP از RPC | — | — |
| `pending_inquiries` | — | — | — | — |
| `audit_logs` | فقط Admin / `is_admin()` | فقط trusted server/service role؛ بدون client policy | — | — |
| `collection_seo` | Public اگر والد منتشرشده و `not robots_noindex`; Admin همه | Admin | Admin | Admin |
| `series_seo` | Public اگر والد منتشرشده و `not robots_noindex`; Admin همه | Admin | Admin | Admin |
| `product_seo` | Public اگر والد منتشرشده و `not robots_noindex`; Admin همه | Admin | Admin | Admin |
| `storage.objects` برای Bucketهای MVP | `anon` و `authenticated` برای سه bucket عمومی | فقط Admin / bucket مجاز + `is_admin()` | فقط Admin / `USING + CHECK` | فقط Admin / `is_admin()` |

## نکات اجرایی

1. Policyهای Admin کاتالوگ از `FOR ALL USING (is_admin()) WITH CHECK (is_admin())` استفاده می‌کنند.
2. مالک inquiry از claim یا payload کلاینت استخراج نمی‌شود؛ join به `customer_profiles` اجباری است.
3. `pending_inquiries` علاوه بر نداشتن Policy، برای `anon` و `authenticated` دارای `REVOKE ALL` است.
4. RPC استعلام `SECURITY INVOKER` است؛ بنابراین Policyهای INSERT همان کاربر احرازشده را اعمال می‌کند.
5. Owner پس از submit اجازه UPDATE/DELETE ندارد؛ اصلاح وضعیت فقط در اختیار Admin است.
6. `audit_logs` append-only است و کلاینت ادمین نیز اجازه INSERT مستقیم ندارد.
7. Migration نهایی `20250201000700_finalize_inquiry_rls.sql` همه Policyهای تاریخی سه جدول استعلام را حذف و فقط مجموعه canonical فوق را بازسازی می‌کند.
8. روی `inquiry_items` پس از ثبت هیچ Policy برای UPDATE/DELETE وجود ندارد؛ اقلام ارسالی immutable هستند.
9. Bucketهای `catalog-media`، `catalog-documents` و `seo-media` دارای `public=true` هستند؛ Policy SELECT برای Storage API است و URL مستقیم CDN عمداً بدون Signed URL خوانده می‌شود.
10. هیچ Policy نوشتن Storage برای `anon` وجود ندارد؛ INSERT/UPDATE/DELETE فقط برای session احرازشده‌ای است که `is_admin()` را پاس کند.
