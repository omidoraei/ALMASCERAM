// =============================================================================
// ثابت‌های سراسری اپلیکیشن (مطابق با documentation ۴)
// =============================================================================

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'کاتالوگ کاشی و سرامیک';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const APPLICATION_TYPE_LABELS: Record<string, string> = {
  floor: 'کف',
  wall: 'دیوار',
  floor_and_wall: 'کف و دیوار',
  facade: 'نمای ساختمان',
  pool_and_wet_areas: 'استخر و فضای مرطوب',
  outdoor_landscape: 'محوطه‌سازی و فضای باز',
};

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار بررسی',
  reviewing: 'در حال بررسی',
  quoted: 'قیمت اعلام شد',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  individual: 'مصرف‌کننده نهایی',
  contractor: 'پیمانکار',
  architect: 'معمار/طراح',
  retailer: 'نماینده/فروشگاه',
  wholesaler: 'عمده‌فروش',
};

export const BRAND_COLORS = {
  bronze: '#8B7355',
  bronzeDark: '#6B5940',
  bronzeLight: '#A6907A',
  ink: '#1F1B16',
  paper: '#FAF8F5',
};

export const INQUIRY_CART_STORAGE_KEY = 'tile-catalog:inquiry-cart';
export const PENDING_SESSION_STORAGE_KEY = 'tile-catalog:pending-session';
