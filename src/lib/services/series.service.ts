// =============================================================================
// Service Layer — Series
// لایه: 8.2
// =============================================================================
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  mockSeriesList,
  findSeriesByCollection,
  findSeriesBySlug,
  type MockSeries,
} from '@/lib/data/mock-catalog';

export async function getSeriesByCollectionSlug(collectionSlug: string): Promise<MockSeries[]> {
  if (!isSupabaseConfigured()) return findSeriesByCollection(collectionSlug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('series')
      .select('id, collection_id, name_fa, name_en, slug, description, cover_image_url, collections!inner(slug)')
      .eq('collections.slug', collectionSlug)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return findSeriesByCollection(collectionSlug);

    return data.map((row: any) => ({
      id: row.id,
      collection_id: row.collection_id,
      collection_slug: collectionSlug,
      name_fa: row.name_fa,
      name_en: row.name_en,
      slug: row.slug,
      description: row.description ?? '',
      cover_image_url: row.cover_image_url ?? '/images/hero.jpg',
    }));
  } catch {
    return findSeriesByCollection(collectionSlug);
  }
}

export async function getSeriesBySlug(slug: string): Promise<MockSeries | null> {
  if (!isSupabaseConfigured()) return findSeriesBySlug(slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('series')
      .select('id, collection_id, name_fa, name_en, slug, description, cover_image_url, collections(slug)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return findSeriesBySlug(slug);
    const row: any = data;

    return {
      id: row.id,
      collection_id: row.collection_id,
      collection_slug: row.collections?.slug ?? '',
      name_fa: row.name_fa,
      name_en: row.name_en,
      slug: row.slug,
      description: row.description ?? '',
      cover_image_url: row.cover_image_url ?? '/images/hero.jpg',
    };
  } catch {
    return findSeriesBySlug(slug);
  }
}
