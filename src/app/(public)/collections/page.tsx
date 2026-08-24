import type { Metadata } from 'next';
import { CollectionCard } from '@/components/public/collection-card';
import { getAllCollections } from '@/lib/services/collections.service';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'کالکشن‌های کاشی و سرامیک',
  description: 'مروری کامل بر کالکشن‌های کاشی و سرامیک موجود در کاتالوگ.',
};

export default async function CollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">Collections</span>
        <h1 className="mt-2 text-4xl font-black text-ink-900">کالکشن‌های محصولات</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-500">
          هر کالکشن شامل چندین سری طراحی است که با دقت فنی و زیبایی‌شناسی طراحی انتخاب شده‌اند.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
