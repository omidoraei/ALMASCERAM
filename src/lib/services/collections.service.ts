// =============================================================================
// Service Layer — Collections
// لایه: 8.2 (Service Layer) — تمام دسترسی‌ها از طریق Supabase Client و تحت RLS
// انجام می‌شود. در صورت عدم پیکربندی Supabase یا بروز خطا، به داده نمایشی
// (mock-catalog) بازمی‌گردد تا تجربه کاربری هرگز مختل نشود.
// =============================================================================
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  mockCollections,
  findCollectionBySlug,
  getFeaturedCollections as getMockFeaturedCollections,
  type MockCollection,
} from '@/lib/data/mock-catalog';

export async function getAllCollections(): Promise<MockCollection[]> {
  if (!isSupabaseConfigured()) return mockCollections;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('id, name_fa, name_en, slug, description, cover_image_url, is_featured')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return mockCollections;

    return data.map((row) => ({
      id: row.id,
      name_fa: row.name_fa,
      name_en: row.name_en,
      slug: row.slug,
      description: row.description ?? '',
      cover_image_url: row.cover_image_url ?? '/images/hero.jpg',
      is_featured: row.is_featured,
      product_count: 0,
    }));
  } catch {
    return mockCollections;
  }
}

export async function getFeaturedCollections(): Promise<MockCollection[]> {
  const all = await getAllCollections();
  const featured = all.filter((c) => c.is_featured);
  return featured.length > 0 ? featured : getMockFeaturedCollections();
}

export async function getCollectionBySlug(slug: string): Promise<MockCollection | null> {
  if (!isSupabaseConfigured()) return findCollectionBySlug(slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('id, name_fa, name_en, slug, description, cover_image_url, is_featured')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return findCollectionBySlug(slug);

    return {
      id: data.id,
      name_fa: data.name_fa,
      name_en: data.name_en,
      slug: data.slug,
      description: data.description ?? '',
      cover_image_url: data.cover_image_url ?? '/images/hero.jpg',
      is_featured: data.is_featured,
      product_count: 0,
    };
  } catch {
    return findCollectionBySlug(slug);
  }
}
