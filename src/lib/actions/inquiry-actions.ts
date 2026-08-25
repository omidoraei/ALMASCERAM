import { z } from 'zod'
import { inquirySchema, otpSchema, type InquiryFormValues } from '../validation/inquiry'
import { createInquiryFromBasketSchema, type CreateInquiryFromBasketInput } from '../validation/inquiry-basket'
import { supabase } from '../supabase/client'
import { useInquiryStore } from '../../store/inquiry-store'

const inquiryIdSchema = z.uuid()
const emailSchema = z.email()

function requireSupabase() {
  if (!supabase) throw new Error('اتصال Supabase پیکربندی نشده است')
  return supabase
}

/** Uses Supabase Auth directly; no Edge Function or application server is invoked. */
export async function requestInquiryEmailOtp(input: InquiryFormValues) {
  const profile = inquirySchema.parse(input)
  const { error } = await requireSupabase().auth.signInWithOtp({
    email: profile.email,
    options: {
      shouldCreateUser: true,
      data: {
        customer_type: profile.customerType,
        full_name: profile.fullName,
        phone: profile.phone,
        company_name: profile.company || null,
        city: profile.projectCity,
      },
    },
  })
  if (error) throw new Error('ارسال کد تأیید ناموفق بود؛ کمی بعد دوباره تلاش کنید')
  return { email: profile.email }
}

export async function verifyInquiryEmailOtp(email: string, token: string) {
  const validatedEmail = emailSchema.parse(email)
  const { otp } = otpSchema.parse({ otp: token })
  const { data, error } = await requireSupabase().auth.verifyOtp({ email: validatedEmail, token: otp, type: 'email' })
  if (error || !data.session || !data.user) throw new Error('کد تأیید معتبر نیست یا منقضی شده است')
  return { userId: data.user.id }
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

export async function verifyOtpAndCreateInquiry(args: {
  email: string
  token: string
  basket: CreateInquiryFromBasketInput
}) {
  await verifyInquiryEmailOtp(args.email, args.token)
  return createInquiryFromBasket(args.basket)
}
