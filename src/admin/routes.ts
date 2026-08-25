export type AdminRouteId =
  | 'dashboard' | 'taxonomy-surface' | 'taxonomy-finishes' | 'taxonomy-spaces'
  | 'collections' | 'series' | 'products' | 'sizes'
  | 'seo-collection' | 'seo-series' | 'seo-product' | 'inquiries' | 'settings'

export const ADMIN_ROUTES: Record<AdminRouteId, { path: string; eyebrow: string; title: string }> = {
  dashboard: { path: '/admin', eyebrow: 'مرکز کنترل', title: 'نمای کلی امروز' },
  'taxonomy-surface': { path: '/admin/taxonomies/surfaces', eyebrow: 'طبقه‌بندی', title: 'مدیریت سطوح' },
  'taxonomy-finishes': { path: '/admin/taxonomies/finishes', eyebrow: 'طبقه‌بندی', title: 'مدیریت پرداخت‌ها' },
  'taxonomy-spaces': { path: '/admin/taxonomies/spaces', eyebrow: 'طبقه‌بندی', title: 'مدیریت فضاها' },
  collections: { path: '/admin/catalog/collections', eyebrow: 'کاتالوگ', title: 'کالکشن‌ها' },
  series: { path: '/admin/catalog/series', eyebrow: 'کاتالوگ', title: 'سری‌ها' },
  products: { path: '/admin/catalog/products', eyebrow: 'کاتالوگ', title: 'مدیریت محصولات' },
  sizes: { path: '/admin/catalog/sizes', eyebrow: 'کاتالوگ فنی', title: 'سایزها و رسانه‌ها' },
  'seo-collection': { path: '/admin/seo/collections', eyebrow: 'Technical SEO', title: 'SEO کالکشن‌ها' },
  'seo-series': { path: '/admin/seo/series', eyebrow: 'Technical SEO', title: 'SEO سری‌ها' },
  'seo-product': { path: '/admin/seo/products', eyebrow: 'Technical SEO', title: 'SEO محصولات' },
  inquiries: { path: '/admin/inquiries', eyebrow: 'فروش پروژه‌ای', title: 'استعلام‌های قیمت' },
  settings: { path: '/admin/settings', eyebrow: 'سیستم', title: 'تنظیمات و امنیت' },
}

export function adminRouteFromPath(pathname: string): AdminRouteId {
  const match = (Object.entries(ADMIN_ROUTES) as Array<[AdminRouteId, (typeof ADMIN_ROUTES)[AdminRouteId]]>)
    .find(([, route]) => route.path === pathname.replace(/\/$/, '') || (route.path === '/admin' && pathname === '/admin/'))
  return match?.[0] ?? 'dashboard'
}
