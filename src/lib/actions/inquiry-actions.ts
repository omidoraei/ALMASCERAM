import { z } from 'zod'
import { inquirySchema, type InquiryFormValues } from '../validation/inquiry'
import { createInquiryFromBasketSchema, type CreateInquiryFromBasketInput } from '../validation/inquiry-basket'
import { supabase } from '../supabase/client'
import { useInquiryStore } from '../../store/inquiry-store'

/** UUID schema for the inquiry ID returned by the RPC. @internal */
const inquiryIdSchema = z.uuid()

/**
 * Schema for the pending-inquiry payload stored in localStorage between
 * the Magic Link request and the callback completion. Validated strictly
 * to defend against tampering from other browser tabs.
 * @internal
 */
const pendingMagicInquirySchema = z.object({
  email: z.email(),
  note: z.string().max(2000).optional(),
  createdAt: z.number().int().positive(),
})

/** localStorage key for the in-flight inquiry awaiting Magic Link confirmation. */
const PENDING_MAGIC_INQUIRY_KEY = 'almasceram-pending-magic-inquiry'

/**
 * Returns true when a Magic Link was requested but the user has not yet
 * returned from their email inbox. Used by the `/auth/callback` page to
 * decide whether to run the inquiry-completion flow after sign-in.
 *
 * @returns `true` if there is a pending inquiry in localStorage
 */
export const hasPendingMagicInquiry = () => typeof window !== 'undefined' && localStorage.getItem(PENDING_MAGIC_INQUIRY_KEY) !== null

/**
 * Returns the public Supabase client or throws if not configured.
 * @throws Error when Supabase environment variables are missing
 * @internal
 */
function requireSupabase() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

/**
 * Requests a PKCE Magic Link directly from Supabase Auth. Persists the
 * form payload in localStorage so the inquiry can be completed after the
 * user confirms the link. No application server is invoked.
 *
 * @param input - The validated inquiry form values
 * @returns An object with the email that received the link
 * @throws ZodError if the input fails schema validation
 * @throws Error when Supabase is unconfigured or the request fails
 *
 * @example
 * await requestInquiryMagicLink({
 *   customerType: 'business',
 *   fullName: 'علی رضایی',
 *   email: 'ali@example.com',
 *   phone: '09123456789',
 *   projectCity: 'تهران',
 *   notes: 'پروژه اداری'
 * })
 * // → { email: 'ali@example.com' }
 * // User receives an email; clicking the link lands on /auth/callback
 */
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
 * The local inquiry-cart state is cleared only after PostgreSQL returns
 * the committed inquiry UUID, so a network failure leaves the user able
 * to retry without losing their selections.
 *
 * @param input - The basket to submit (1-50 items, no duplicate sizeIds)
 * @returns The newly created inquiry's UUID
 * @throws ZodError if the input fails schema validation
 * @throws Error with a localized message for known RPC failure codes
 *
 * @example
 * const { inquiryId } = await createInquiryFromBasket({
 *   items: [
 *     { sizeId: 'a1', quantity: 2 },
 *     { sizeId: 'b2', quantity: 1 }
 *   ],
 *   note: 'پروژه اداری'
 * })
 * // → { inquiryId: 'uuid' }
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

/**
 * Completes the inquiry after a Magic Link sign-in. Called from the
 * `/auth/callback` page once the Supabase session is established. Validates
 * the pending payload (email match, expiry ≤ 30 minutes) and delegates to
 * {@link createInquiryFromBasket} for the atomic RPC.
 *
 * @param code - Optional authorization code from the URL. If omitted, an
 *               existing session is reused.
 * @returns The created inquiry ID
 * @throws Error when:
 *   - The code is invalid or expired
 *   - No session was established
 *   - The pending payload is missing or tampered
 *   - The signed-in email does not match the original request
 *   - More than 30 minutes have passed since the original request
 *   - The RPC fails (with localized message)
 *
 * @example
 * // In the /auth/callback page:
 * const search = new URLSearchParams(window.location.search)
 * const code = search.get('code')
 * const { inquiryId } = await completeMagicLinkInquiry(code)
 * // → { inquiryId: 'uuid' }
 */
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
