'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { List, X, MagnifyingGlass, User } from '@phosphor-icons/react/dist/ssr';
import { cn } from '@/lib/utils/cn';
import { SITE_NAME } from '@/lib/utils/constants';
import { InquiryCartButton } from '@/components/public/inquiry-cart-button';

const navItems = [
  { href: '/', label: 'صفحه اصلی' },
  { href: '/collections', label: 'کالکشن‌ها' },
  { href: '/search', label: 'جستجوی محصول' },
  { href: '/account', label: 'حساب من' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-paper/85 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bronze-500 text-lg font-black text-white">
            ک
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-black text-ink-900">{SITE_NAME}</span>
            <span className="text-[11px] text-ink-400">کاتالوگ تخصصی برای معماران و مشاورین</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-bronze-50 hover:text-bronze-700',
                pathname === item.href && 'bg-bronze-50 text-bronze-700'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden h-11 w-11 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors hover:border-bronze-300 hover:text-bronze-600 sm:flex"
            aria-label="جستجو"
          >
            <MagnifyingGlass className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            className="hidden h-11 w-11 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors hover:border-bronze-300 hover:text-bronze-600 sm:flex"
            aria-label="حساب من"
          >
            <User className="h-5 w-5" />
          </Link>
          <InquiryCartButton />
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-200 text-ink-700 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="منو"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-ink-200 bg-paper px-4 py-3 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'rounded-lg px-4 py-3 text-sm font-medium text-ink-600 transition-colors hover:bg-bronze-50 hover:text-bronze-700',
                pathname === item.href && 'bg-bronze-50 text-bronze-700'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
