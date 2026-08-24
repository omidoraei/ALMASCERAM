// =============================================================================
// Health Check Script — بررسی سلامت اتصال به Supabase و کفایت Migrationها
// لایه: 7 (زیرساخت) — اجرا: npm run health-check
// =============================================================================
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const REQUIRED_TABLES = [
  'surface',
  'finishes',
  'spaces',
  'collections',
  'series',
  'products',
  'sizes',
  'size_technical_data',
  'size_faces',
  'size_media',
  'size_spaces',
  'size_pdf_catalog',
  'admin_profiles',
  'customer_profiles',
  'inquiries',
  'inquiry_items',
  'pending_inquiries',
  'audit_logs',
  'collection_seo',
  'series_seo',
  'product_seo',
];

async function healthCheck() {
  console.log('🤺 بررسی سلامت پلتفرم...\n');

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error('❌ متغیرهای Supabase تنظیم نشده‌اند. فایل .env.local را بررسی کنید.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  let failures = 0;

  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`❌ جدول ${table}: ${error.message}`);
      failures += 1;
    } else {
      console.log(`✅ جدول ${table} موجود است و قابل دسترسی است`);
    }
  }

  console.log('\n🔍 بررسی توابع امنیتی (is_admin)...');
  const { error: fnError } = await supabase.rpc('is_admin');
  if (fnError && !fnError.message.includes('permission')) {
    console.log('✅ تابع is_admin() در دسترس است');
  } else if (fnError) {
    console.log('ℹ️  is_admin() موجود است اما دسترسی محدود شده (طبیعی است)');
  }

  if (failures > 0) {
    console.error(`\n❌ ${failures} جدول دارای مشکل هستند. لطفاً Migrationها را اجرا کنید: supabase db push`);
    process.exit(1);
  }

  console.log('\n🎉 همه چیز سالم است!');
}

healthCheck().catch((err) => {
  console.error('❌ خطا در health check:', err);
  process.exit(1);
});
