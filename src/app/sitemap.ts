import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils/constants';
import { getAllCollections } from '@/lib/services/collections.service';
import { mockProducts } from '@/lib/data/mock-catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await getAllCollections();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/collections`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: 'weekly', priority: 0.5 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = mockProducts.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
