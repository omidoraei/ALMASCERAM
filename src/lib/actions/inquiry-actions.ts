import { z } from 'zod'
import { inquirySchema, type InquiryFormValues } from '../validation/inquiry'
import { createInquiryFromBasketSchema, type CreateInquiryFromBasketInput } from '../validation/inquiry-basket'
import { supabase } from '../supabase/client'
import { useInquiryStore } from '../../store/inquiry-store'

const inquiryIdSchema = z.uuid()
const pendingMagicInquirySchema = z.object({
  email: z.email(),
  note: z.string().max(2000).optional(),
  createdAt: z.number().int().positive(),
})
const PENDING_MAGIC_INQUIRY_KEY = 'kara-pending-magic-inquiry'

export const hasPendingMagicInquiry = () => localStorage.getItem(PENDING_MAGIC_INQUIRY_KEY) !== null

function requireSupabase() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

/** Requests a PKCE Magic Link directly from Supabase Auth; no application server is invoked. */
export async function requestInquiryMagicLink(input: InquiryFormValues) {
  const profile = inquirySchema.parse(input)
  const pending = pendingMagicInquirySchema.parse({ email: profile.email, note: profile.notes, createdAt: Date.now() })
  localStorage.setItem(PENDING_MAGIC_INQUIRY_KEY, JSON.stringify(pending))
  const { error } = await requireSupabase().auth.signInWithOtp({
    email: profile.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        customer_type: profile.customerType,
        full_name: profile.fullName,
        phone: profile.phone,
        company_name: profile.company || null,
        city: profile.projectCity,
      },
    },
  })
  if (error) {
    localStorage.removeItem(PENDING_MAGIC_INQUIRY_KEY)
    throw new Error('ارسال لینک ورود ناموفق بود؛ کمی بعد دوباره تلاش کنید')
  }
  return { email: profile.email }
}

/**
 * Performs exactly one authenticated RPC call for the whole basket.
 * localStorage is cleared only after PostgreSQL returns the committed inquiry UUID.
 */
export async function createInquiryFromBasket(input: CreateInquiryFromBasketInput) {
  const validated = createInquiryFromBasketSchema.parse(input)
  const rpcItems = validated.items.map((item) => ({
    size_id: item.sizeId,
    quantity: item.quantity,
    requested_sqm: item.requestedSqm,
    note: item.note,
  }))

  const { data, error } = await requireSupabase().rpc('create_inquiry_from_basket', {
    items: rpcItems,
    note: validated.note || null,
  })
  if (error) {
    const knownMessages: Record<string, string> = {
      authentication_required: 'ابتدا ایمیل خود را تأیید کنید',
      customer_profile_required: 'پروفایل مشتری ایجاد نشده است',
      items_must_be_an_array: 'ساختار سبد استعلام معتبر نیست',
      basket_item_count_out_of_range: 'تعداد اقلام سبد باید بین ۱ تا ۵۰ باشد',
      inquiry_note_too_long: 'توضیحات استعلام بیش از حد مجاز است',
      invalid_basket_item: 'یکی از اقلام سبد اطلاعات نامعتبر دارد',
      duplicate_size_in_basket: 'یک سایز بیش از یک‌بار در سبد وجود دارد',
      basket_contains_unavailable_size: 'یکی از سایزهای انتخاب‌شده دیگر در دسترس نیست',
      inquiry_creation_not_allowed: 'ایجاد استعلام برای این حساب مجاز نیست',
    }
    const knownError = Object.entries(knownMessages).find(([code]) => error.message.includes(code))
    throw new Error(knownError?.[1] ?? 'ثبت استعلام انجام نشد؛ لطفاً دوباره تلاش کنید')
  }

  const inquiryId = inquiryIdSchema.parse(data)
  useInquiryStore.getState().clear()
  return { inquiryId }
}

export async function completeMagicLinkInquiry(code?: string | null) {
  const client = requireSupabase()
  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code)
    if (error) throw new Error('لینک ورود معتبر نیست یا منقضی شده است')
  }
  const { data: { session } } = await client.auth.getSession()
  if (!session) throw new Error('نشست احرازشده ایجاد نشد؛ لینک را دوباره درخواست کنید')

  const rawPending = localStorage.getItem(PENDING_MAGIC_INQUIRY_KEY)
  if (!rawPending) throw new Error('اطلاعات استعلام در این مرورگر پیدا نشد')
  const pending = pendingMagicInquirySchema.parse(JSON.parse(rawPending) as unknown)
  if (session.user.email?.trim().toLowerCase() !== pending.email.trim().toLowerCase()) {
    throw new Error('ایمیل نشست با درخواست استعلام این مرورگر مطابقت ندارد')
  }
  if (Date.now() - pending.createdAt > 30 * 60 * 1000) throw new Error('درخواست استعلام منقضی شده است؛ دوباره اقدام کنید')

  const items = useInquiryStore.getState().items
  const result = await createInquiryFromBasket({
    items: items.map((item) => ({ sizeId: item.size.id, quantity: item.quantity })),
    note: pending.note,
  })
  localStorage.removeItem(PENDING_MAGIC_INQUIRY_KEY)
  return result
}
