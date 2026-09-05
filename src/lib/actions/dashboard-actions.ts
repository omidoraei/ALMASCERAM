import { supabase } from '../supabase/client'
import { cached } from '../utils/cache'

function client() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

async function count(table: 'collections' | 'series' | 'products' | 'sizes' | 'inquiries', status?: string) {
  let query = client().from(table).select('id', { count: 'exact', head: true })
  if (status) query = query.eq('status', status)
  const { count: total, error } = await query
  if (error) throw error
  return total ?? 0
}

export function getAdminDashboardCounts() {
  return cached('admin:dashboard-counts', async () => {
    const [collections, series, products, sizes, submitted, inReview, quoted] = await Promise.all([
      count('collections'), count('series'), count('products'), count('sizes'),
      count('inquiries', 'submitted'), count('inquiries', 'in_review'), count('inquiries', 'quoted'),
    ])
    return { collections, series, products, sizes, inquiries: { submitted, inReview, quoted } }
  }, 30_000)
}
