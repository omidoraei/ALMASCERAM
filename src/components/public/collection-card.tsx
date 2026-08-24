import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpLeft } from '@phosphor-icons/react/dist/ssr';
import type { MockCollection } from '@/lib/data/mock-catalog';

export function CollectionCard({ collection }: { collection: MockCollection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-2xl border border-ink-200 shadow-industrial transition-all duration-300 hover:-translate-y-1 hover:shadow-industrial-lg"
    >
      <Image
        src={collection.cover_image_url}
        alt={collection.name_fa}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/20 to-transparent" />
      <div className="relative z-10 flex flex-col gap-2 p-6">
        <span className="text-xs font-medium uppercase tracking-widest text-bronze-300">{collection.name_en}</span>
        <h3 className="text-2xl font-black text-white">{collection.name_fa}</h3>
        <p className="line-clamp-2 text-sm text-ink-200">{collection.description}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-bronze-300 transition-transform group-hover:-translate-x-1">
          مشاهده محصولات <ArrowUpLeft className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
