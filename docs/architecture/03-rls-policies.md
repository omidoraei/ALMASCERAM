# سیاست‌های RLS (خلاصه)

| جدول | Select عمومی | Insert | Update | Delete |
|---|---|---|---|---|
| collections/series/products/sizes | فقط `is_active=true` یا ادمین | فقط ادمین | فقط ادمین | فقط ادمین |
| size_technical_data / size_media / size_faces / size_spaces / size_pdf_catalog | عمومی (بدون فیلتر فعال بودن، چون والد کنترل می‌کند) | فقط ادمین | فقط ادمین | فقط ادمین |
| *_seo (collection/series/product) | عمومی (برای SSR Metadata) | فقط ادمین | فقط ادمین | فقط ادمین |
| admin_profiles | خودش یا super_admin | ❌ (فقط service_role) | خودش یا super_admin | ❌ |
| customer_profiles | خودش یا ادمین | ❌ (فقط trigger) | خودش | ❌ |
| inquiries | مالک (`customer_id=auth.uid()`) یا ادمین | مالک | فقط ادمین | ❌ |
| inquiry_items | از طریق مالکیت inquiry والد یا ادمین | از طریق مالکیت inquiry والد | فقط ادمین | فقط ادمین |
| pending_inquiries | ❌ هیچ‌کس (فقط service_role) | ❌ | ❌ | ❌ |
| audit_logs | فقط super_admin | ❌ (فقط service_role) | ❌ | ❌ |

تمام توابع کمکی (`is_admin`, `get_admin_role`, `is_customer`) با
`SECURITY DEFINER` و `search_path` ثابت نوشته شده‌اند تا از حملات
Privilege Escalation جلوگیری شود.
