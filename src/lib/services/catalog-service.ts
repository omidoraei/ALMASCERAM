import { z } from 'zod'
import { supabase } from '../supabase/client'

const publicProductSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  description: z.string().nullable(),
  color_name: z.string().nullable(),
  sizes: z.array(z.object({
    id: z.uuid(), width_mm: z.number(), height_mm: z.number(), thickness_mm: z.number(), is_rectified: z.boolean(),
  })),
})

export async function getPublishedProducts() {
  if (!supabase) return []
  const { data, error } = await supabase.from('products').select('id,name,slug,sku,description,color_name,sizes(id,width_mm,height_mm,thickness_mm,is_rectified)').eq('is_published', true).order('sort_order')
  if (error) throw error
  return z.array(publicProductSchema).parse(data)
}
