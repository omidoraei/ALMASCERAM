// =============================================================================
// داده‌های نمایشی (Fallback Demo Data)
// لایه: 8.2 (Service Layer) — این داده‌ها ساختاری کاملاً منطبق با اسکیمای واقعی
// دیتابیس دارند و *فقط* زمانی استفاده می‌شوند که Supabase پیکربندی نشده باشد یا
// کوئری با خطا مواجه شود. هدف: امکان دمو و پیش‌نمایش زنده بدون نیاز به بک‌اند واقعی.
// در محیط Production با اتصال واقعی Supabase، این فایل هرگز استفاده نمی‌شود.
// =============================================================================

export interface MockSurface {
  id: string;
  name_fa: string;
  name_en: string;
  slug: string;
}

export interface MockSpace {
  id: string;
  name_fa: string;
  slug: string;
  icon: string;
}

export interface MockSizeTechnicalData {
  pei_rating: number;
  water_absorption_percent: number;
  breaking_strength_n: number;
  mohs_hardness: number;
  slip_resistance_r_rating: string;
  frost_resistant: boolean;
  chemical_resistance: string;
  standard_reference: string;
}

export interface MockSize {
  id: string;
  product_id: string;
  size_label: string;
  width_mm: number;
  height_mm: number;
  thickness_mm: number;
  is_rectified: boolean;
  packaging_pieces_per_box: number;
  packaging_boxes_per_pallet: number;
  packaging_m2_per_box: number;
  packaging_weight_per_box_kg: number;
  technical_data: MockSizeTechnicalData;
  spaces: string[]; // space slugs
}

export interface MockProduct {
  id: string;
  series_id: string;
  collection_slug: string;
  series_slug: string;
  surface_slug: string;
  name_fa: string;
  name_en: string;
  slug: string;
  sku_prefix: string;
  description: string;
  application_type: string;
  color_family: string;
  design_pattern: string;
  cover_image_url: string;
  is_featured: boolean;
  sizes: MockSize[];
}

export interface MockSeries {
  id: string;
  collection_id: string;
  collection_slug: string;
  name_fa: string;
  name_en: string;
  slug: string;
  description: string;
  cover_image_url: string;
}

export interface MockCollection {
  id: string;
  name_fa: string;
  name_en: string;
  slug: string;
  description: string;
  cover_image_url: string;
  is_featured: boolean;
  product_count: number;
}

export const mockSurfaces: MockSurface[] = [
  { id: 'srf-1', name_fa: 'پرسلان', name_en: 'Porcelain', slug: 'porcelain' },
  { id: 'srf-2', name_fa: 'سرامیک', name_en: 'Ceramic', slug: 'ceramic' },
  { id: 'srf-3', name_fa: 'موزاییک', name_en: 'Mosaic', slug: 'mosaic' },
];

export const mockSpaces: MockSpace[] = [
  { id: 'spc-1', name_fa: 'پذیرایی', slug: 'living-room', icon: 'Armchair' },
  { id: 'spc-2', name_fa: 'آشپزخانه', slug: 'kitchen', icon: 'CookingPot' },
  { id: 'spc-3', name_fa: 'حمام', slug: 'bathroom', icon: 'Bathtub' },
  { id: 'spc-4', name_fa: 'نمای ساختمان', slug: 'facade', icon: 'Buildings' },
  { id: 'spc-5', name_fa: 'استخر', slug: 'pool', icon: 'Waves' },
  { id: 'spc-6', name_fa: 'محوطه بیرونی', slug: 'outdoor', icon: 'Tree' },
];

const baseTechnical = (overrides: Partial<MockSizeTechnicalData> = {}): MockSizeTechnicalData => ({
  pei_rating: 4,
  water_absorption_percent: 0.1,
  breaking_strength_n: 1350,
  mohs_hardness: 8,
  slip_resistance_r_rating: 'R10',
  frost_resistant: true,
  chemical_resistance: 'مقاوم در برابر اسیدها و مواد شوینده خانگی',
  standard_reference: 'ISO 13006',
  ...overrides,
});

export const mockCollections: MockCollection[] = [
  {
    id: 'col-1',
    name_fa: 'مجموعه مرمر اعیانی',
    name_en: 'Marble Elegance',
    slug: 'marble-elegance',
    description:
      'الهام‌گرفته از مرمرهای طبیعی ایتالیا، این مجموعه با رگه‌های ظریف و سطحی درخشان، فضایی لوکس و بی‌زمان می‌آفریند.',
    cover_image_url: '/images/collections/marble-elegance.jpg',
    is_featured: true,
    product_count: 3,
  },
  {
    id: 'col-2',
    name_fa: 'مجموعه بتن شهری',
    name_en: 'Urban Concrete',
    slug: 'urban-concrete',
    description: 'طراحی صنعتی مدرن با بافت بتن خام، مناسب فضاهای مینیمال و لافت‌های امروزی.',
    cover_image_url: '/images/collections/urban-concrete.jpg',
    is_featured: true,
    product_count: 1,
  },
  {
    id: 'col-3',
    name_fa: 'مجموعه میراث چوب',
    name_en: 'Wood Heritage',
    slug: 'wood-heritage',
    description: 'گرمای طبیعی چوب با دوام و کارایی پرسلان — بدون نگهداری چوب طبیعی.',
    cover_image_url: '/images/collections/wood-heritage.jpg',
    is_featured: false,
    product_count: 1,
  },
  {
    id: 'col-4',
    name_fa: 'مجموعه ترازو کلاسیک',
    name_en: 'Terrazzo Classic',
    slug: 'terrazzo-classic',
    description: 'بازگشت ترند ترازو با ترکیب رنگ‌های خنثی و دانه‌های رنگی برای فضاهای پرتردد.',
    cover_image_url: '/images/collections/terrazzo-classic.jpg',
    is_featured: false,
    product_count: 1,
  },
];

export const mockSeriesList: MockSeries[] = [
  {
    id: 'ser-1',
    collection_id: 'col-1',
    collection_slug: 'marble-elegance',
    name_fa: 'سری کاررارا',
    name_en: 'Carrara Series',
    slug: 'carrara',
    description: 'برداشتی مدرن از سنگ مرمر کارارای ایتالیا با رگه‌های نقره‌ای ظریف.',
    cover_image_url: '/images/products/carrara-white.jpg',
  },
  {
    id: 'ser-2',
    collection_id: 'col-1',
    collection_slug: 'marble-elegance',
    name_fa: 'سری امپرادور',
    name_en: 'Emperador Series',
    slug: 'emperador',
    description: 'مرمر قهوه‌ای تیره با رگه‌های طلایی، انتخابی برای فضاهای رسمی و لوکس.',
    cover_image_url: '/images/products/emperador-dark.jpg',
  },
  {
    id: 'ser-3',
    collection_id: 'col-2',
    collection_slug: 'urban-concrete',
    name_fa: 'سری اوربان',
    name_en: 'Urban Series',
    slug: 'urban',
    description: 'بافت بتن خاکستری خالص برای طراحی داخلی صنعتی.',
    cover_image_url: '/images/products/urban-gray.jpg',
  },
  {
    id: 'ser-4',
    collection_id: 'col-3',
    collection_slug: 'wood-heritage',
    name_fa: 'سری اوک',
    name_en: 'Oak Series',
    slug: 'oak',
    description: 'طرح چوب بلوط طبیعی با جزئیات گره و بافت واقعی.',
    cover_image_url: '/images/products/oak-plank.jpg',
  },
  {
    id: 'ser-5',
    collection_id: 'col-4',
    collection_slug: 'terrazzo-classic',
    name_fa: 'سری میکس',
    name_en: 'Mix Series',
    slug: 'mix',
    description: 'ترکیب رنگی دانه‌های سنگی روی زمینه روشن برای فضاهای پرتردد.',
    cover_image_url: '/images/products/terrazzo-mix.jpg',
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: 'prd-1',
    series_id: 'ser-1',
    collection_slug: 'marble-elegance',
    series_slug: 'carrara',
    surface_slug: 'porcelain',
    name_fa: 'کاررارا وایت',
    name_en: 'Carrara White',
    slug: 'carrara-white',
    sku_prefix: 'CRW',
    description:
      'کاشی پرسلان تمام‌بدنه با طرح مرمر کارارای ایتالیا، سطح براق و رگه‌های نقره‌ای ظریف. مقاوم در برابر سایش و مناسب ترافیک بالا.',
    application_type: 'floor_and_wall',
    color_family: 'سفید و طوسی',
    design_pattern: 'مرمر',
    cover_image_url: '/images/products/carrara-white.jpg',
    is_featured: true,
    sizes: [
      {
        id: 'sz-1',
        product_id: 'prd-1',
        size_label: '60×120',
        width_mm: 600,
        height_mm: 1200,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 2,
        packaging_boxes_per_pallet: 32,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 32.5,
        technical_data: baseTechnical(),
        spaces: ['living-room', 'kitchen', 'bathroom'],
      },
      {
        id: 'sz-2',
        product_id: 'prd-1',
        size_label: '80×80',
        width_mm: 800,
        height_mm: 800,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 3,
        packaging_boxes_per_pallet: 28,
        packaging_m2_per_box: 1.92,
        packaging_weight_per_box_kg: 43.2,
        technical_data: baseTechnical({ pei_rating: 5 }),
        spaces: ['living-room', 'kitchen'],
      },
      {
        id: 'sz-3',
        product_id: 'prd-1',
        size_label: '30×60',
        width_mm: 300,
        height_mm: 600,
        thickness_mm: 8.5,
        is_rectified: true,
        packaging_pieces_per_box: 8,
        packaging_boxes_per_pallet: 48,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 28.4,
        technical_data: baseTechnical(),
        spaces: ['bathroom'],
      },
    ],
  },
  {
    id: 'prd-2',
    series_id: 'ser-2',
    collection_slug: 'marble-elegance',
    series_slug: 'emperador',
    surface_slug: 'porcelain',
    name_fa: 'امپرادور دارک',
    name_en: 'Emperador Dark',
    slug: 'emperador-dark',
    sku_prefix: 'EMD',
    description: 'کاشی پرسلان با طرح مرمر قهوه‌ای تیره و رگه‌های طلایی، مناسب لابی و فضاهای رسمی.',
    application_type: 'floor_and_wall',
    color_family: 'قهوه‌ای تیره',
    design_pattern: 'مرمر',
    cover_image_url: '/images/products/emperador-dark.jpg',
    is_featured: true,
    sizes: [
      {
        id: 'sz-4',
        product_id: 'prd-2',
        size_label: '60×120',
        width_mm: 600,
        height_mm: 1200,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 2,
        packaging_boxes_per_pallet: 32,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 33.1,
        technical_data: baseTechnical({ mohs_hardness: 8.5 }),
        spaces: ['living-room', 'facade'],
      },
      {
        id: 'sz-5',
        product_id: 'prd-2',
        size_label: '60×60',
        width_mm: 600,
        height_mm: 600,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 4,
        packaging_boxes_per_pallet: 36,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 32.0,
        technical_data: baseTechnical(),
        spaces: ['living-room'],
      },
    ],
  },
  {
    id: 'prd-3',
    series_id: 'ser-1',
    collection_slug: 'marble-elegance',
    series_slug: 'carrara',
    surface_slug: 'porcelain',
    name_fa: 'کاررارا استاتوآریو',
    name_en: 'Carrara Statuario',
    slug: 'carrara-statuario',
    sku_prefix: 'CRS',
    description: 'نسخه پرمیوم کارارا با رگه‌های درشت‌تر و کنتراست بالاتر، ویژه پروژه‌های خاص معماری.',
    application_type: 'floor_and_wall',
    color_family: 'سفید',
    design_pattern: 'مرمر',
    cover_image_url: '/images/products/carrara-white.jpg',
    is_featured: false,
    sizes: [
      {
        id: 'sz-6',
        product_id: 'prd-3',
        size_label: '100×100',
        width_mm: 1000,
        height_mm: 1000,
        thickness_mm: 10,
        is_rectified: true,
        packaging_pieces_per_box: 2,
        packaging_boxes_per_pallet: 20,
        packaging_m2_per_box: 2.0,
        packaging_weight_per_box_kg: 52.0,
        technical_data: baseTechnical({ pei_rating: 5, breaking_strength_n: 1500 }),
        spaces: ['living-room'],
      },
    ],
  },
  {
    id: 'prd-4',
    series_id: 'ser-3',
    collection_slug: 'urban-concrete',
    series_slug: 'urban',
    surface_slug: 'porcelain',
    name_fa: 'اوربان گری',
    name_en: 'Urban Gray',
    slug: 'urban-gray',
    sku_prefix: 'URG',
    description: 'کاشی پرسلان با بافت بتن خام خاکستری، سطح مات و ضدلغزندگی بالا برای فضاهای صنعتی.',
    application_type: 'floor_and_wall',
    color_family: 'خاکستری',
    design_pattern: 'بتن',
    cover_image_url: '/images/products/urban-gray.jpg',
    is_featured: true,
    sizes: [
      {
        id: 'sz-7',
        product_id: 'prd-4',
        size_label: '60×60',
        width_mm: 600,
        height_mm: 600,
        thickness_mm: 9.5,
        is_rectified: true,
        packaging_pieces_per_box: 4,
        packaging_boxes_per_pallet: 34,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 33.6,
        technical_data: baseTechnical({ slip_resistance_r_rating: 'R11' }),
        spaces: ['facade', 'outdoor'],
      },
      {
        id: 'sz-8',
        product_id: 'prd-4',
        size_label: '30×60',
        width_mm: 300,
        height_mm: 600,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 8,
        packaging_boxes_per_pallet: 44,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 30.2,
        technical_data: baseTechnical({ slip_resistance_r_rating: 'R10' }),
        spaces: ['kitchen'],
      },
    ],
  },
  {
    id: 'prd-5',
    series_id: 'ser-4',
    collection_slug: 'wood-heritage',
    series_slug: 'oak',
    surface_slug: 'porcelain',
    name_fa: 'اوک پلانک نچرال',
    name_en: 'Oak Plank Natural',
    slug: 'oak-plank-natural',
    sku_prefix: 'OPN',
    description: 'کاشی پرسلان طرح چوب بلوط با جزئیات گره طبیعی، مقاوم در برابر رطوبت برخلاف چوب اصیل.',
    application_type: 'floor',
    color_family: 'قهوه‌ای روشن',
    design_pattern: 'چوب',
    cover_image_url: '/images/products/oak-plank.jpg',
    is_featured: false,
    sizes: [
      {
        id: 'sz-9',
        product_id: 'prd-5',
        size_label: '20×120',
        width_mm: 200,
        height_mm: 1200,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 6,
        packaging_boxes_per_pallet: 40,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 31.0,
        technical_data: baseTechnical({ water_absorption_percent: 0.2 }),
        spaces: ['living-room', 'kitchen'],
      },
    ],
  },
  {
    id: 'prd-6',
    series_id: 'ser-5',
    collection_slug: 'terrazzo-classic',
    series_slug: 'mix',
    surface_slug: 'porcelain',
    name_fa: 'ترازو میکس رنگی',
    name_en: 'Terrazzo Color Mix',
    slug: 'terrazzo-color-mix',
    sku_prefix: 'TCM',
    description: 'طرح ترازو با دانه‌های رنگی روی زمینه روشن، انتخابی مدرن برای فضاهای تجاری و مسکونی.',
    application_type: 'floor_and_wall',
    color_family: 'کرم و چندرنگ',
    design_pattern: 'ترازو',
    cover_image_url: '/images/products/terrazzo-mix.jpg',
    is_featured: false,
    sizes: [
      {
        id: 'sz-10',
        product_id: 'prd-6',
        size_label: '60×60',
        width_mm: 600,
        height_mm: 600,
        thickness_mm: 9,
        is_rectified: true,
        packaging_pieces_per_box: 4,
        packaging_boxes_per_pallet: 36,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 32.8,
        technical_data: baseTechnical(),
        spaces: ['living-room', 'kitchen'],
      },
    ],
  },
];

export function findCollectionBySlug(slug: string) {
  return mockCollections.find((c) => c.slug === slug) ?? null;
}

export function findSeriesByCollection(collectionSlug: string) {
  return mockSeriesList.filter((s) => s.collection_slug === collectionSlug);
}

export function findSeriesBySlug(slug: string) {
  return mockSeriesList.find((s) => s.slug === slug) ?? null;
}

export function findProductsBySeries(seriesSlug: string) {
  return mockProducts.filter((p) => p.series_slug === seriesSlug);
}

export function findProductsByCollection(collectionSlug: string) {
  return mockProducts.filter((p) => p.collection_slug === collectionSlug);
}

export function findProductBySlug(slug: string) {
  return mockProducts.find((p) => p.slug === slug) ?? null;
}

export function getFeaturedProducts() {
  return mockProducts.filter((p) => p.is_featured);
}

export function getFeaturedCollections() {
  return mockCollections.filter((c) => c.is_featured);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockProducts.filter(
    (p) =>
      p.name_fa.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.sku_prefix.toLowerCase().includes(q) ||
      p.color_family.toLowerCase().includes(q) ||
      p.design_pattern.toLowerCase().includes(q)
  );
}
