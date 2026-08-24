'use client';

import { useEffect, useState } from 'react';
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/ssr';
import { useInquiryCartStore } from '@/store/inquiry-cart.store';
import { toPersianDigits } from '@/lib/utils/format';

export function InquiryCartButton() {
  const [mounted, setMounted] = useState(false);
  const items = useInquiryCartStore((s) => s.items);
  const toggleDrawer = useInquiryCartStore((s) => s.toggleDrawer);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantityBox, 0) : 0;

  return (
    <button
      onClick={toggleDrawer}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-ink-200 text-ink-700 transition-colors hover:border-bronze-300 hover:text-bronze-600"
      aria-label="سبد استعلام"
    >
      <ShoppingCartSimple className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-bronze-500 px-1 text-[10px] font-bold text-white">
          {toPersianDigits(count)}
        </span>
      )}
    </button>
  );
}
