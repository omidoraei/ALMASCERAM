# قرارداد نهایی Enumها

این سند ADR-003 و منبع حقیقت دامنه برای Migration `20250201000100` است. تغییر مقدار Enum فقط با Migration افزایشی مجاز است؛ rename/delete مستقیم ممنوع است.

| Enum | مقادیر نهایی | کاربرد |
|---|---|---|
| `application_type` | `floor`, `wall`, `facade`, `pool`, `outdoor`, `industrial` | کاربرد فیزیکی هر سایز |
| `admin_role` | `super_admin`, `catalog_manager`, `sales_manager`, `content_manager`, `viewer` | تفکیک حداقل دسترسی کارکنان |
| `customer_type` | `individual`, `business`, `architect`, `contractor`, `distributor` | طبقه‌بندی لید/مشتری |
| `inquiry_status` | `draft`, `pending_verification`, `submitted`, `in_review`, `quoted`, `closed`, `cancelled` | چرخه عمر استعلام |
| `audit_log_level` | `info`, `warning`, `error`, `critical` | شدت رخداد ممیزی |

## قواعد انتقال وضعیت استعلام

- RPC عمومی فقط `submitted` ایجاد می‌کند؛ وضعیت‌های `draft` و `pending_verification` در MVP سمت DB استفاده نمی‌شوند.
- `submitted → in_review → quoted → closed` مسیر عادی تیم فروش است.
- `submitted | in_review | quoted → cancelled` فقط توسط ادمین مجاز است.
- بازگشت از `closed` یا `cancelled` نیازمند نقش `super_admin` و ثبت audit مستقل است.
