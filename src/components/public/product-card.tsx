import Link from 'next/link';
import Image from 'next/image';
import { Ruler, ArrowUpLeft } from '@phosphor-icons/react/dist/ssr';
import { Badge } from '@/components/ui/badge';
import { APPLICATION_TYPE_LABELS } from '@/lib/utils/constants';
import type { MockProduct } from '@/lib/data/mock-catalog';

export function ProductCard({ product }: { product: MockProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-industrial transition-all duration-300 hover:-translate-y-1 hover:shadow-industrial-lg"
    >
      <div className="relative h-64 overflow-hidden bg-ink-100">
        <Image
          src={product.cover_image_url}
          alt={product.name_fa}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {product.is_featured && <Badge variant="default">منتخب</Badge>}
          <Badge variant="soft">{product.sku_prefix}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-bronze-500">{product.name_en}</span>
        <h3 className="text-lg font-bold text-ink-900">{product.name_fa}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{product.description}</p>
        <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4 text-bronze-500" />
            {product.sizes.length} سایز موجود
          </span>
          <span className="font-medium text-ink-600">{APPLICATION_TYPE_LABELS[product.application_type]}</span>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-600">
          مشاهده جزئیات و استعلام قیمت <ArrowUpLeft className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
