# نقشه دیتابیس (ERD متنی)

```
surface ──┐
finishes ─┼──> products <── series <── collections
spaces ───┘        │
                    ├──> sizes ──> size_technical_data (1:1)
                    │        ├──> size_faces (1:N)
                    │        ├──> size_media (1:N)
                    │        ├──> size_spaces (N:N با spaces)
                    │        └──> size_pdf_catalog (1:N)
                    └──> product_seo (1:1)

collections ──> collection_seo (1:1)
series ──> series_seo (1:1)

auth.users ──> admin_profiles (1:1)
auth.users ──> customer_profiles (1:1, از طریق trigger handle_new_customer)

customer_profiles ──> inquiries (1:N) ──> inquiry_items (1:N) ──> products / sizes

pending_inquiries: مستقل، کلید session_token، فقط از طریق service_role

audit_logs: مستقل، ثبت هر عملیات حساس (immutable)
```

## Enums نهایی (Single Source of Truth)
- `application_type`: floor, wall, floor_and_wall, facade, pool_and_wet_areas, outdoor_landscape
- `admin_role`: super_admin, content_manager, sales_manager, viewer
- `customer_type`: individual, contractor, architect, retailer, wholesaler
- `inquiry_status`: pending, reviewing, quoted, completed, cancelled
- `audit_log_level`: info, warning, error, critical

منبع کامل و دقیق در `supabase/migrations/20240601000100_01_enums.sql`
