import type { Metadata } from 'next';
import { ProductCard } from '@/components/public/product-card';
import { SearchForm } from '@/components/public/search-form';
import { searchProducts } from '@/lib/services/products.service';

export const metadata: Metadata = { title: 'جستجوی محصول' };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = '' } = await searchParams;
  const results = q ? await searchProducts(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">Search</span>
        <h1 className="mt-2 text-4xl font-black text-ink-900">جستجوی محصول</h1>
        <p className="mt-4 text-ink-500">بر اساس نام، کد محصول، رنگ یا طرح مورد نظرتان جستجو کنید.</p>
        <div className="mt-8">
          <SearchForm defaultValue={q} />
        </div>
      </div>

      {q && (
        <p className="mb-6 text-sm text-ink-500">
          {results.length > 0 ? `${results.length} نتیجه برای «${q}» یافت شد` : `نتیجه‌ای برای «${q}» یافت نشد`}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
