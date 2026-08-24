'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCartSimple, Check } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { TechnicalDataTable } from '@/components/public/technical-data-table';
import { useInquiryCartStore } from '@/store/inquiry-cart.store';
import { formatDimensions, toPersianDigits } from '@/lib/utils/format';
import { APPLICATION_TYPE_LABELS } from '@/lib/utils/constants';
import type { MockProduct, MockSize } from '@/lib/data/mock-catalog';

export function SizeSelector({ product }: { product: MockProduct }) {
  const [activeSize, setActiveSize] = useState<MockSize>(product.sizes[0]!);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useInquiryCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productNameFa: product.name_fa,
      productImageUrl: product.cover_image_url,
      sizeId: activeSize.id,
      sizeLabel: activeSize.size_label,
      quantityBox: quantity,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold text-ink-700">انتخاب سایز (میلیمتر)</h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setActiveSize(size)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                activeSize.id === size.id
                  ? 'border-bronze-500 bg-bronze-500 text-white shadow-industrial'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-bronze-300'
              }`}
            >
              {size.size_label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-500">
          ابعاد دقیق: {formatDimensions(activeSize.width_mm, activeSize.height_mm)} &middot; کاربرد: {APPLICATION_TYPE_LABELS[product.application_type]}
        </p>
      </div>

      <TechnicalDataTable size={activeSize} />

      <div className="flex flex-col gap-3 rounded-xl border border-bronze-200 bg-bronze-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-700">تعداد کارتون:</span>
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white">
            <button
              className="flex h-10 w-10 items-center justify-center text-ink-500 hover:text-bronze-600"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-8 text-center text-sm font-bold">{toPersianDigits(quantity)}</span>
            <button
              className="flex h-10 w-10 items-center justify-center text-ink-500 hover:text-bronze-600"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Button size="lg" onClick={handleAdd} className="gap-2">
          {justAdded ? <Check className="h-5 w-5" /> : <ShoppingCartSimple className="h-5 w-5" />}
          {justAdded ? 'افزوده شد!' : 'افزودن به سبد استعلام'}
        </Button>
      </div>
    </div>
  );
}
