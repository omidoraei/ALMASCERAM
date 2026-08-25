import { z } from 'zod'
import { supabase } from '../supabase/client'
import { inquiryAdminStatusSchema } from '../validation/admin-catalog'
import { requireAdminClient } from '../auth/require-admin-client'

const idSchema = z.uuid()

function requireClient() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

export async function updateInquiryStatus(inquiryId: string, nextStatus: unknown) {
  const id = idSchema.parse(inquiryId)
  const status = inquiryAdminStatusSchema.parse(nextStatus)
  const closedAt = status === 'closed' || status === 'cancelled' ? new Date().toISOString() : null
  const { client } = await requireAdminClient()
  const { data, error } = await client.from('inquiries').update({ status, closed_at: closedAt } as never).eq('id', id).select('id,status,updated_at').single()
  if (error) throw error
  return data
}

export async function getAdminInquiries() {
  const client = requireClient()
  const { data, error } = await client.from('inquiries').select('id,inquiry_number,status,project_city,company_name,customer_id,submitted_at,inquiry_items(count)').order('submitted_at', { ascending: false }).limit(100)
  if (error) throw error
  const inquiries = data as unknown as Array<{ customer_id: string } & Record<string, unknown>>
  const customerIds = [...new Set(inquiries.map((item) => item.customer_id))]
  if (customerIds.length === 0) return []

  // No direct FK exists from inquiries.customer_id to customer_profiles.user_id,
  // so PostgREST embedding would be ambiguous. Join the two RLS-protected reads here.
  const { data: profiles, error: profileError } = await client.from('customer_profiles').select('user_id,full_name').in('user_id', customerIds)
  if (profileError) throw profileError
  const names = new Map((profiles as Array<{ user_id: string; full_name: string | null }>).map((profile) => [profile.user_id, profile.full_name]))
  return inquiries.map((inquiry) => ({ ...inquiry, customer_name: names.get(inquiry.customer_id) ?? null }))
}
