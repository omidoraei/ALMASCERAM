-- =============================================================================
-- Migration 10: Indexes & Helper Views
-- لایه: 7 | بهینه‌سازی کوئری‌های پرتکرار SSR/ISR
-- =============================================================================

create index if not exists idx_collections_slug on public.collections(slug);
create index if not exists idx_series_slug on public.series(slug);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_sizes_size_label on public.sizes(size_label);
create index if not exists idx_inquiries_inquiry_number on public.inquiries(inquiry_number);
create index if not exists idx_inquiries_email on public.inquiries(email);

-- View کمکی: شمارش سایزهای هر محصول برای نمایش سریع در کارت محصول (بدون N+1)
create or replace view public.product_size_summary as
select
  p.id as product_id,
  count(s.id) as total_sizes,
  min(s.width_mm) as min_width_mm,
  max(s.width_mm) as max_width_mm
from public.products p
left join public.sizes s on s.product_id = p.id and s.is_active = true
group by p.id;

comment on view public.product_size_summary is 'خلاصه تعداد و بازه سایزهای فعال هر محصول برای نمایش سریع در کارت‌ها';
