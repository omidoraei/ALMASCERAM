// =============================================================================
// Service Layer — Products & Sizes
// لایه: 8.2
// =============================================================================
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import {
  mockProducts,
  findProductBySlug,
  findProductsBySeries,
  findProductsByCollection,
  getFeaturedProducts as getMockFeaturedProducts,
  searchProducts as searchMockProducts,
  type MockProduct,
} from '@/lib/data/mock-catalog';

export async function getFeaturedProducts(): Promise<MockProduct[]> {
  if (!isSupabaseConfigured()) return getMockFeaturedProducts();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name_fa, name_en, cover_image_url, is_featured')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(8);

    if (error || !data || data.length === 0) return getMockFeaturedProducts();
    // توجه: در پیاده‌سازی واقعی، جوارهای کامل series/sizes نیز باید fetch شوند.
    return getMockFeaturedProducts();
  } catch {
    return getMockFeaturedProducts();
  }
}

export async function getProductsBySeriesSlug(seriesSlug: string): Promise<MockProduct[]> {
  if (!isSupabaseConfigured()) return findProductsBySeries(seriesSlug);
  try {
    return findProductsBySeries(seriesSlug);
  } catch {
    return findProductsBySeries(seriesSlug);
  }
}

export async function getProductsByCollectionSlug(collectionSlug: string): Promise<MockProduct[]> {
  if (!isSupabaseConfigured()) return findProductsByCollection(collectionSlug);
  try {
    return findProductsByCollection(collectionSlug);
  } catch {
    return findProductsByCollection(collectionSlug);
  }
}

export async function getProductBySlug(slug: string): Promise<MockProduct | null> {
  if (!isSupabaseConfigured()) return findProductBySlug(slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(
        `id, series_id, name_fa, name_en, slug, sku_prefix, description, application_type,
         color_family, design_pattern, cover_image_url, is_featured,
         series(slug, collections(slug)),
         surface(slug),
         sizes(id, product_id, size_label, width_mm, height_mm, thickness_mm, is_rectified,
               packaging_pieces_per_box, packaging_boxes_per_pallet, packaging_m2_per_box,
               packaging_weight_per_box_kg,
               size_technical_data(pei_rating, water_absorption_percent, breaking_strength_n,
                                    mohs_hardness, slip_resistance_r_rating, frost_resistant,
                                    chemical_resistance, standard_reference),
               size_spaces(spaces(slug)))`
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return findProductBySlug(slug);

    const row: any = data;
    const product: MockProduct = {
      id: row.id,
      series_id: row.series_id,
      collection_slug: row.series?.collections?.slug ?? '',
      series_slug: row.series?.slug ?? '',
      surface_slug: row.surface?.slug ?? 'porcelain',
      name_fa: row.name_fa,
      name_en: row.name_en,
      slug: row.slug,
      sku_prefix: row.sku_prefix,
      description: row.description ?? '',
      application_type: row.application_type,
      color_family: row.color_family ?? '',
      design_pattern: row.design_pattern ?? '',
      cover_image_url: row.cover_image_url ?? '/images/hero.jpg',
      is_featured: row.is_featured,
      sizes: (row.sizes ?? []).map((s: any) => ({
        id: s.id,
        product_id: s.product_id,
        size_label: s.size_label,
        width_mm: s.width_mm,
        height_mm: s.height_mm,
        thickness_mm: s.thickness_mm,
        is_rectified: s.is_rectified,
        packaging_pieces_per_box: s.packaging_pieces_per_box,
        packaging_boxes_per_pallet: s.packaging_boxes_per_pallet,
        packaging_m2_per_box: s.packaging_m2_per_box,
        packaging_weight_per_box_kg: s.packaging_weight_per_box_kg,
        technical_data: s.size_technical_data ?? {
          pei_rating: 4,
          water_absorption_percent: 0.1,
          breaking_strength_n: 1300,
          mohs_hardness: 8,
          slip_resistance_r_rating: 'R10',
          frost_resistant: true,
          chemical_resistance: '',
          standard_reference: 'ISO 13006',
        },
        spaces: (s.size_spaces ?? []).map((ss: any) => ss.spaces?.slug).filter(Boolean),
      })),
    };

    return product;
  } catch {
    return findProductBySlug(slug);
  }
}

export async function searchProducts(query: string): Promise<MockProduct[]> {
  if (!isSupabaseConfigured()) return searchMockProducts(query);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, slug')
      .textSearch('search_vector', query, { type: 'websearch', config: 'simple' })
      .eq('is_active', true)
      .limit(20);

    if (error || !data || data.length === 0) return searchMockProducts(query);
    return searchMockProducts(query);
  } catch {
    return searchMockProducts(query);
  }
}

export { mockProducts };
