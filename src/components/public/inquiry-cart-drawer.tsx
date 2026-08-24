'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash, Minus, Plus, ShoppingCartSimple } from '@phosphor-icons/react/dist/ssr';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInquiryCartStore } from '@/store/inquiry-cart.store';
import { toPersianDigits } from '@/lib/utils/format';

export function InquiryCartDrawer() {
  const isOpen = useInquiryCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useInquiryCartStore((s) => s.closeDrawer);
  const items = useInquiryCartStore((s) => s.items);
  const updateQuantity = useInquiryCartStore((s) => s.updateQuantity);
  const removeItem = useInquiryCartStore((s) => s.removeItem);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeDrawer())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartSimple className="h-5 w-5 text-bronze-500" />
            سبد استعلام قیمت
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-ink-400">
            <ShoppingCartSimple className="h-12 w-12" />
            <p className="text-sm">سبد استعلام شما خالی است.</p>
            <p className="text-xs">از صفحه محصولات، سایز مورد نظر خود را انتخاب کنید.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto pl-1">
              {items.map((item) => (
                <div key={item.sizeId} className="flex gap-3 rounded-xl border border-ink-200 bg-white p-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    <Image src={item.productImageUrl} alt={item.productNameFa} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-bold text-ink-900">{item.productNameFa}</span>
                    <span className="text-xs text-ink-500">سایز: {item.sizeLabel}</span>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-lg border border-ink-200">
                        <button
                          className="flex h-7 w-7 items-center justify-center text-ink-500 hover:text-bronze-600"
                          onClick={() => updateQuantity(item.sizeId, item.quantityBox - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-xs font-bold">{toPersianDigits(item.quantityBox)}</span>
                        <button
                          className="flex h-7 w-7 items-center justify-center text-ink-500 hover:text-bronze-600"
                          onClick={() => updateQuantity(item.sizeId, item.quantityBox + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        className="text-ink-400 transition-colors hover:text-red-500"
                        onClick={() => removeItem(item.sizeId)}
                        aria-label="حذف"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs text-ink-500">
                توجه: این یک فروشگاه آنلاین نیست. پس از ارسال، کارشناسان ما قیمت دقیق را برای شما ارسال می‌کنند.
              </p>
              <Button asChild size="lg" className="w-full" onClick={closeDrawer}>
                <Link href="/inquiry">ادامه و ارسال استعلام</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
