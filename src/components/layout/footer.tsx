import Link from 'next/link';
import { EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react/dist/ssr';
import { SITE_NAME } from '@/lib/utils/constants';

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-900 text-ink-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bronze-500 text-base font-black text-white">
              ک
            </span>
            <span className="text-base font-black text-white">{SITE_NAME}</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-ink-400">
            پلتفرم تخصصی نمایش محصولات کاشی و سرامیک با جزئیات کامل فنی سایز‌ها. برای دریافت
            استعلام قیمت دقیق، محصولات مورد نظر خود را به سبد استعلام اضافه کنید.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">دسترسی سریع</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/collections" className="transition-colors hover:text-bronze-300">کالکشن‌ها</Link></li>
            <li><Link href="/search" className="transition-colors hover:text-bronze-300">جستجوی محصول</Link></li>
            <li><Link href="/inquiry" className="transition-colors hover:text-bronze-300">سبد استعلام</Link></li>
            <li><Link href="/account" className="transition-colors hover:text-bronze-300">حساب کاربری</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">ارتباط با ما</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-bronze-400" /> ۰۲۱-۸۸۰۰۰۰۰۰</li>
            <li className="flex items-center gap-2"><EnvelopeSimple className="h-4 w-4 text-bronze-400" /> info@tile-catalog.ir</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-bronze-400" /> تهران، شهرک صنعتی</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} {SITE_NAME} — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
