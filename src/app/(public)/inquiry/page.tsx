import type { Metadata } from 'next';
import { InquiryFlow } from '@/components/public/inquiry-flow';

export const metadata: Metadata = { title: 'سبد استعلام قیمت' };

export default function InquiryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-bronze-500">Inquiry Cart</span>
        <h1 className="mt-2 text-4xl font-black text-ink-900">سبد استعلام قیمت</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">
          محصولات انتخابی خود را بازبینی کنید، اطلاعات تماس را وارد کرده و با احراز هویت ایمیلی، استعلام
          خود را نهایی کنید.
        </p>
      </div>
      <InquiryFlow />
    </div>
  );
}
