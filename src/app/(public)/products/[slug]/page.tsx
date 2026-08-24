import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CaretLeft } from '@phosphor-icons/react/dist/ssr';
import { Badge } from '@/components/ui/badge';
import { SizeSelector } from '@/components/public/size-selector';
import { getProductBySlug } from '@/lib/services/products.service';
import { APPLICATION_TYPE_LABELS } from '@/lib/utils/constants';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'محصول یافت نشد' };
  return {
    title: product.name_fa,
    description: product.description,
    openGraph: { images: [product.cover_image_url] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-500">
        <Link href="/collections" className="hover:text-bronze-600">کالکشن‌ها</Link>
        <CaretLeft className="h-3 w-3" />
        <Link href={`/collections/${product.collection_slug}`} className="hover:text-bronze-600">
          {product.collection_slug}
        </Link>
        <CaretLeft className="h-3 w-3" />
        <span className="text-ink-800">{product.name_fa}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative h-96 overflow-hidden rounded-2xl border border-ink-200 shadow-industrial lg:h-full">
          <Image src={product.cover_image_url} alt={product.name_fa} fill className="object-cover" priority />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="soft">{product.sku_prefix}</Badge>
            <Badge variant="outline">{APPLICATION_TYPE_LABELS[product.application_type]}</Badge>
            {product.is_featured && <Badge>محصول منتخب</Badge>}
          </div>
          <span className="mt-4 block text-xs font-medium uppercase tracking-widest text-bronze-500">{product.name_en}</span>
          <h1 className="mt-1 text-3xl font-black text-ink-900 sm:text-4xl">{product.name_fa}</h1>
          <p className="mt-4 leading-8 text-ink-500">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-ink-200 bg-white p-4 text-sm">
            <div>
              <dt className="text-ink-400">خانواده رنگ</dt>
              <dd className="font-semibold text-ink-800">{product.color_family}</dd>
            </div>
            <div>
              <dt className="text-ink-400">طرح</dt>
              <dd className="font-semibold text-ink-800">{product.design_pattern}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <SizeSelector product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
