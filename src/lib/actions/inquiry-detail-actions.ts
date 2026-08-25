import { supabase } from '../supabase/client'
import { catalogIdSchema } from '../validation/catalog'

export async function getInquiryItems(inquiryId: string) {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  const id = catalogIdSchema.parse(inquiryId)
  const { data, error } = await supabase.from('inquiry_items').select('id,quantity,requested_sqm,notes,size_id,sizes(width_mm,height_mm,thickness_mm,products(name,sku))').eq('inquiry_id', id).order('created_at')
  if (error) throw new Error('دریافت اقلام استعلام انجام نشد')
  return data
}
