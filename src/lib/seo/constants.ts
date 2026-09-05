/**
 * SEO constants — single source of truth for the site identity, used
 * by both the static `<head>` (in `index.html`) and the runtime hook
 * `useSEO` for SPA route changes.
 *
 * The defaults are loaded from Vite env vars (if any) so deployment
 * environments can override them without code changes.
 */
export const SITE_NAME = 'ALMASCERAM'
export const SITE_NAME_FA = 'الماس سرام'
export const SITE_TAGLINE = 'کاتالوگ تخصصی کاشی و سرامیک پرسلان'
export const SITE_DESCRIPTION =
  'کاتالوگ تخصصی محصولات پرسلانی ALMASCERAM؛ مقایسه مشخصات فنی سایزها و ثبت استعلام قیمت پروژه‌ای. مناسب معماران، طراحان و پیمانکاران.'
export const SITE_KEYWORDS = [
  'کاشی',
  'سرامیک',
  'پرسلان',
  'کاتالوگ کاشی',
  'استعلام قیمت',
  'کاشی ایرانی',
  'سرامیک پرسلانی',
  'ALMASCERAM',
  'الماس سرام',
]
export const SITE_LOCALE = 'fa_IR'
export const SITE_COUNTRY = 'IR'
export const SITE_AUTHOR = 'ALMASCERAM'
export const SITE_URL = import.meta.env['VITE_SITE_URL'] || 'https://almasceram.ir'
export const OG_IMAGE = `${SITE_URL}/images/hero-architecture.jpg`
export const TWITTER_HANDLE = '@almasceram'

export const CONTACT = {
  email: 'project@almasceram.ir',
  phone: '+98-21-8876-5400',
  address: {
    street: 'بلوار میرداماد',
    city: 'تهران',
    region: 'تهران',
    postalCode: '1547914511',
    country: 'IR',
  },
  geo: {
    latitude: 35.7589,
    longitude: 51.4257,
  },
}
