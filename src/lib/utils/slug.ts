export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateInquiryNumber(sequence: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `INQ-${y}${m}${d}-${String(sequence).padStart(4, '0')}`;
}

/**
 * تولید شماره استعلام یکتا بدون نیاز به کوئری جداگانه به دیتابیس (بدون race condition).
 * فرمت: INQ-YYYYMMDD-XXXXXX (بخش پایانی از crypto.randomUUID مشتق می‌شود)
 */
export function generateInquiryNumberRandom(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
      : Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INQ-${y}${m}${d}-${random}`;
}
