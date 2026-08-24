import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import { Toaster } from 'sonner';
import { SITE_NAME, SITE_URL } from '@/lib/utils/constants';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | کاتالوگ هوشمند کاشی و سرامیک`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'پلتفرم نمایش تخصصی محصولات کاشی و سرامیک با جزئیات فنی دقیق سایزها، مناسب معماران، پیمانکاران و مصرف‌کنندگان نهایی. سیستم استعلام قیمت هوشمند بدون نیاز به خرید آنلاین.',
  keywords: ['کاشی', 'سرامیک', 'کاتالوگ کاشی', 'استعلام قیمت کاشی', 'پرسلان', 'کاشی دیجیتال'],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: 'کاتالوگ تخصصی محصولات کاشی و سرامیک با سیستم استعلام قیمت هوشمند.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors dir="rtl" toastOptions={{ style: { fontFamily: 'inherit' } }} />
      </body>
    </html>
  );
}
