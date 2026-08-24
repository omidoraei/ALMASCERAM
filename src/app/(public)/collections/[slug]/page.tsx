import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpLeft } from '@phosphor-icons/react/dist/ssr';
import { ProductCard } from '@/components/public/product-card';
import { getCollectionBySlug } from '@/lib/services/collections.service';
import { getSeriesByCollectionSlug } from '@/lib/services/series.service';
import { getProductsByCollectionSlug } from '@/lib/services/products.service';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: 'کالکشن یافت نشد' };
  return {
    title: collection.name_fa,
    description: collection.description,
    openGraph: { images: [collection.cover_image_url] },
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [collection, seriesList, products] = await Promise.all([
    getCollectionBySlug(slug),
    getSeriesByCollectionSlug(slug),
    getProductsByCollectionSlug(slug),
  ]);

  if (!collection) notFound();

  return (
    <div>
      <section className="relative h-80 overflow-hidden border-b border-ink-200">
        <Image src={collection.cover_image_url} alt={collection.name_fa} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 to-ink-900/30" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-bronze-300">{collection.name_en}</span>
          <h1 className="mt-2 text-4xl font-black text-white">{collection.name_fa}</h1>
          <p className="mt-3 max-w-2xl text-sm text-ink-200">{collection.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {seriesList.length > 0 && (
          <div className="mb-12 flex flex-wrap gap-3">
            {seriesList.map((series) => (
              <Link
                key={series.id}
                href={`/collections/${collection.slug}#series-${series.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-bronze-300 hover:text-bronze-700"
              >
                {series.name_fa} <ArrowUpLeft className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        )}

        <h2 className="mb-6 text-2xl font-black text-ink-900">محصولات این کالکشن</h2>
        {products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-ink-500">محصولی در این کالکشن یافت نشد.</p>
        )}
      </div>
    </div>
  );
}
