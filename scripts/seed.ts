// =============================================================================
// Seed Script — پر کردن دیتابیس با داده نمونه برای توسعه و دمو
// لایه: 7 (زیرساخت) — اجرا: npm run seed
// نیازمند: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY در .env.local
// این اسکریپت از کلاینت service_role استفاده می‌کند و RLS را دور می‌زند؛
// هرگز آن را در محیط Production روی داده واقعی اجرا نکنید.
// =============================================================================
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ متغیرهای NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY در .env.local تنظیم نشده‌اند.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seed() {
  console.log('🌱 شروع seed کردن دیتابیس...');

  // 1) surface
  const { data: surfaces, error: surfaceError } = await supabase
    .from('surface')
    .upsert(
      [
        { name_fa: 'پرسلان', name_en: 'Porcelain', slug: 'porcelain', sort_order: 1 },
        { name_fa: 'سرامیک', name_en: 'Ceramic', slug: 'ceramic', sort_order: 2 },
        { name_fa: 'موزاییک', name_en: 'Mosaic', slug: 'mosaic', sort_order: 3 },
      ],
      { onConflict: 'slug' }
    )
    .select();
  if (surfaceError) throw surfaceError;
  console.log(`✅ ${surfaces?.length ?? 0} نوع بدنه ایجاد شد`);

  // 2) finishes
  const { data: finishes, error: finishError } = await supabase
    .from('finishes')
    .upsert(
      [
        { name_fa: 'مات', name_en: 'Matte', slug: 'matte', sort_order: 1 },
        { name_fa: 'براق', name_en: 'Glossy', slug: 'glossy', sort_order: 2 },
        { name_fa: 'نانو', name_en: 'Nano', slug: 'nano', sort_order: 3 },
      ],
      { onConflict: 'slug' }
    )
    .select();
  if (finishError) throw finishError;
  console.log(`✅ ${finishes?.length ?? 0} نوع پرداخت ایجاد شد`);

  // 3) spaces
  const { data: spaces, error: spacesError } = await supabase
    .from('spaces')
    .upsert(
      [
        { name_fa: 'پذیرایی', name_en: 'Living Room', slug: 'living-room', sort_order: 1 },
        { name_fa: 'آشپزخانه', name_en: 'Kitchen', slug: 'kitchen', sort_order: 2 },
        { name_fa: 'حمام', name_en: 'Bathroom', slug: 'bathroom', sort_order: 3 },
        { name_fa: 'نمای ساختمان', name_en: 'Facade', slug: 'facade', sort_order: 4 },
        { name_fa: 'استخر', name_en: 'Pool', slug: 'pool', sort_order: 5 },
      ],
      { onConflict: 'slug' }
    )
    .select();
  if (spacesError) throw spacesError;
  console.log(`✅ ${spaces?.length ?? 0} فضای پیشنهادی ایجاد شد`);

  // 4) collections + series + products (نمونه حداقلی)
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .upsert(
      {
        name_fa: 'مجموعه مرمر اعیانی',
        name_en: 'Marble Elegance',
        slug: 'marble-elegance',
        description: 'الهام‌گرفته از مرمرهای طبیعی ایتالیا.',
        is_featured: true,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();
  if (collectionError) throw collectionError;

  const { data: series, error: seriesError } = await supabase
    .from('series')
    .upsert(
      {
        collection_id: collection.id,
        name_fa: 'سری کاررارا',
        name_en: 'Carrara Series',
        slug: 'carrara',
        description: 'برداشتی مدرن از سنگ مرمر کارارا.',
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();
  if (seriesError) throw seriesError;

  const { data: product, error: productError } = await supabase
    .from('products')
    .upsert(
      {
        series_id: series.id,
        name_fa: 'کاررارا وایت',
        name_en: 'Carrara White',
        slug: 'carrara-white',
        sku_prefix: 'CRW',
        description: 'کاشی پرسلان با طرح مرمر کارارا.',
        application_type: 'floor_and_wall',
        color_family: 'سفید',
        is_featured: true,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();
  if (productError) throw productError;

  const { data: size, error: sizeError } = await supabase
    .from('sizes')
    .upsert(
      {
        product_id: product.id,
        size_label: '60×120',
        width_mm: 600,
        height_mm: 1200,
        thickness_mm: 9,
        packaging_pieces_per_box: 2,
        packaging_boxes_per_pallet: 32,
        packaging_m2_per_box: 1.44,
        packaging_weight_per_box_kg: 32.5,
      },
      { onConflict: 'product_id,size_label' }
    )
    .select()
    .single();
  if (sizeError) throw sizeError;

  const { error: technicalError } = await supabase.from('size_technical_data').upsert(
    {
      size_id: size.id,
      pei_rating: 4,
      water_absorption_percent: 0.1,
      breaking_strength_n: 1350,
      mohs_hardness: 8,
      slip_resistance_r_rating: 'R10',
      frost_resistant: true,
    },
    { onConflict: 'size_id' }
  );
  if (technicalError) throw technicalError;

  console.log('✅ کالکشن/سری/محصول/سایز نمونه ایجاد شد');
  console.log('🎉 Seed با موفقیت کامل شد.');
}

seed().catch((err) => {
  console.error('❌ خطا در seed:', err);
  process.exit(1);
});
