'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerRequestOtpAction, customerVerifyOtpAction } from '@/lib/actions/auth.actions';

export function CustomerOtpLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    if (!email.includes('@')) {
      toast.error('ایمیل معتبر وارد کنید');
      return;
    }
    setLoading(true);
    const result = await customerRequestOtpAction({ email });
    setLoading(false);
    if (result.success) {
      toast.success('کد تأیید ارسال شد');
      setStep('otp');
    } else {
      toast.error(result.error ?? 'ارسال کد ناموفق بود');
    }
  }

  async function handleVerify() {
    setLoading(true);
    const result = await customerVerifyOtpAction({ email, code });
    setLoading(false);
    if (result.success) {
      toast.success('ورود موفق');
      router.push('/account');
      router.refresh();
    } else {
      toast.error(result.error ?? 'کد نامعتبر است');
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bronze-500 text-white">
        <EnvelopeSimple className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-black text-ink-900">ورود به حساب کاربری</h1>

      {step === 'email' ? (
        <>
          <p className="text-sm text-ink-500">برای مشاهده تاریخچه استعلام‌های خود، ایمیل خود را وارد کنید.</p>
          <div className="space-y-1.5">
            <Label>آدرس ایمیل</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <Button size="lg" className="w-full" onClick={handleRequest} disabled={loading}>
            {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-ink-500">کد ۶ رقمی ارسال‌شده به {email} را وارد کنید.</p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="------"
            className="text-center text-2xl tracking-[0.5em]"
            inputMode="numeric"
          />
          <Button size="lg" className="w-full" onClick={handleVerify} disabled={loading}>
            {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
          </Button>
        </>
      )}
    </div>
  );
}
