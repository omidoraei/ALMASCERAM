// =============================================================================
// توابع قالب‌بندی اعداد/تاریخ برای نمایش فارسی (RTL)
// =============================================================================

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => persianDigits[Number(digit)] ?? digit);
}

export function formatNumber(value: number): string {
  return toPersianDigits(new Intl.NumberFormat('en-US').format(value));
}

export function formatArea(m2: number): string {
  return `${formatNumber(Number(m2.toFixed(2)))} مترمربع`;
}

export function formatDimensions(widthMm: number, heightMm: number): string {
  return `${formatNumber(widthMm)} × ${formatNumber(heightMm)} میلی‌متر`;
}

export function formatRelativeDate(dateIso: string): string {
  const date = new Date(dateIso);
  return toPersianDigits(
    new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
  );
}
