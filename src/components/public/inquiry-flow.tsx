'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Trash,
  Minus,
  Plus,
  ShoppingCartSimple,
  EnvelopeSimple,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useInquiryCartStore } from '@/store/inquiry-cart.store';
import { toPersianDigits } from '@/lib/utils/format';
import { requestInquiryOtpAction, verifyInquiryOtpAction } from '@/lib/actions/inquiry.actions';

type Step = 'cart' | 'contact' | 'otp' | 'success';

export function InquiryFlow() {
  const items = useInquiryCartStore((s) => s.items);
  const sessionToken = useInquiryCartStore((s) => s.sessionToken);
  const updateQuantity = useInquiryCartStore((s) => s.updateQuantity);
  const removeItem = useInquiryCartStore((s) => s.removeItem);
  const clearCart = useInquiryCartStore((s) => s.clearCart);

  const [step, setStep] = useState<Step>('cart');
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState({ fullName: '', phone: '', email: '', companyName: '', city: '', message: '' });
  const [otp, setOtp] = useState('');
  const [inquiryNumber, setInquiryNumber] = useState('');

  async function handleRequestOtp() {
    if (!contact.fullName || !contact.phone || !contact.email) {
      toast.error('لطفاً نام، موبایل و ایمیل را کامل کنید');
      return;
    }
    setLoading(true);
    const result = await requestInquiryOtpAction({
      email: contact.email,
      sessionToken,
      items: items.map((i) => ({ productId: i.productId, sizeId: i.sizeId, quantityBox: i.quantityBox })),
    });
    setLoading(false);

    if (result.success) {
      toast.success('کد تأیید به ایمیل شما ارسال شد');
      setStep('otp');
    } else {
      toast.error(result.error ?? 'ارسال کد تأیید ناموفق بود. لطفاً اتصال Supabase را بررسی کنید.');
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      toast.error('کد تأیید باید ۶ رقمی باشد');
      return;
    }
    setLoading(true);
    const result = await verifyInquiryOtpAction({ email: contact.email, sessionToken, code: otp });
    setLoading(false);

    if (result.success && result.data) {
      setInquiryNumber(result.data.inquiryNumber);
      clearCart();
      setStep('success');
    } else {
      toast.error(result.error ?? 'کد تأیید نادرست است');
    }
  }

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <ShoppingCartSimple className="h-16 w-16 text-ink-300" />
        <h2 className="text-xl font-bold text-ink-800">سبد استعلام شما خالی است</h2>
        <p className="text-sm text-ink-500">برای شروع، از صفحه محصولات، سایز موردنظر خود را انتخاب و اضافه کنید.</p>
        <Button asChild size="lg">
          <Link href="/collections">مرور کاتالوگ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {step === 'cart' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-ink-900">اقلام سبد استعلام</h2>
            {items.map((item) => (
              <div key={item.sizeId} className="flex gap-4 rounded-xl border border-ink-200 bg-white p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  <Image src={item.productImageUrl} alt={item.productNameFa} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1">
                  <span className="font-bold text-ink-900">{item.productNameFa}</span>
                  <span className="text-xs text-ink-500">سایز: {item.sizeLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-ink-200">
                    <button className="flex h-8 w-8 items-center justify-center text-ink-500 hover:text-bronze-600" onClick={() => updateQuantity(item.sizeId, item.quantityBox - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-6 text-center text-xs font-bold">{toPersianDigits(item.quantityBox)}</span>
                    <button className="flex h-8 w-8 items-center justify-center text-ink-500 hover:text-bronze-600" onClick={() => updateQuantity(item.sizeId, item.quantityBox + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button className="text-ink-400 hover:text-red-500" onClick={() => removeItem(item.sizeId)}>
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'contact' && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-ink-900">اطلاعات تماس</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>نام و نام‌خانوادگی *</Label>
                <Input value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} placeholder="مثلاً: علی رضایی" />
              </div>
              <div className="space-y-1.5">
                <Label>شماره موبایل *</Label>
                <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="09xxxxxxxxx" />
              </div>
              <div className="space-y-1.5">
                <Label>ایمیل *</Label>
                <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>نام شرکت (اختیاری)</Label>
                <Input value={contact.companyName} onChange={(e) => setContact({ ...contact, companyName: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>شهر</Label>
                <Input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>توضیحات پروژه (اختیاری)</Label>
                <Textarea value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} placeholder="متراژ تقریبی، زمان‌بندی پروژه و..." />
              </div>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-5 text-center">
            <EnvelopeSimple className="mx-auto h-14 w-14 text-bronze-500" />
            <h2 className="text-xl font-bold text-ink-900">کد تأیید را وارد کنید</h2>
            <p className="text-sm text-ink-500">کد ۶ رقمی به آدرس {contact.email} ارسال شد.</p>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="------"
              className="mx-auto max-w-[220px] text-center text-2xl tracking-[0.5em]"
              inputMode="numeric"
            />
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 py-10 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
            <h2 className="text-2xl font-black text-ink-900">استعلام شما ثبت شد!</h2>
            <p className="text-ink-500">
              شماره پیگیری: <span className="font-mono font-bold text-bronze-600">{inquiryNumber}</span>
            </p>
            <p className="text-sm text-ink-500">کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.</p>
            <Button asChild size="lg">
              <Link href="/">بازگشت به صفحه اصلی</Link>
            </Button>
          </div>
        )}

        {step !== 'success' && (
          <div className="mt-8 flex items-center justify-between">
            {step !== 'cart' ? (
              <Button
                variant="outline"
                onClick={() => setStep(step === 'otp' ? 'contact' : 'cart')}
                disabled={loading}
              >
                <ArrowRight className="h-4 w-4" /> بازگشت
              </Button>
            ) : (
              <span />
            )}

            {step === 'cart' && (
              <Button onClick={() => setStep('contact')} size="lg">
                ادامه <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 'contact' && (
              <Button onClick={handleRequestOtp} size="lg" disabled={loading}>
                {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
              </Button>
            )}
            {step === 'otp' && (
              <Button onClick={handleVerifyOtp} size="lg" disabled={loading}>
                {loading ? 'در حال بررسی...' : 'تأیید و ارسال استعلام'}
              </Button>
            )}
          </div>
        )}
      </div>

      {step !== 'success' && (
        <aside className="h-fit rounded-2xl border border-ink-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-ink-900">خلاصه سبد</h3>
          <div className="space-y-2 text-sm text-ink-600">
            <div className="flex justify-between">
              <span>تعداد اقلام</span>
              <span className="font-bold">{toPersianDigits(items.length)}</span>
            </div>
            <div className="flex justify-between">
              <span>مجموع کارتن</span>
              <span className="font-bold">{toPersianDigits(items.reduce((s, i) => s + i.quantityBox, 0))}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <p className="text-xs leading-6 text-ink-400">
            پس از تأیید نهایی، کارشناسان فروش با بررسی موجودی، قیمت رسمی را به‌صورت اختصاصی برای شما
            ارسال می‌کنند. این فرآیند شامل هیچ‌گونه پرداخت آنلاین نیست.
          </p>
        </aside>
      )}
    </div>
  );
}
