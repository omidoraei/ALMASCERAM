import type { Metadata } from 'next';
import Link from 'next/link';
import { SignOut, ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { customerLogoutAction } from '@/lib/actions/auth.actions';
import { INQUIRY_STATUS_LABELS } from '@/lib/utils/constants';
import { formatRelativeDate, toPersianDigits } from '@/lib/utils/format';

export const metadata: Metadata = { title: 'حساب کاربری' };

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-ink-900">حساب کاربری</h1>
        <p className="mt-4 text-ink-500">
          برای فعال‌سازی کامل این بخش، متغیرهای Supabase را در <code>.env.local</code> تنظیم کنید.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  interface InquiryListItem {
    id: string;
    inquiry_number: string;
    status: string;
    created_at: string;
  }

  const { data: inquiriesRaw } = await supabase
    .from('inquiries')
    .select('id, inquiry_number, status, created_at')
    .eq('customer_id', user?.id ?? '')
    .order('created_at', { ascending: false });

  const inquiries = (inquiriesRaw ?? []) as unknown as InquiryListItem[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink-900">تاریخچه استعلام‌ها</h1>
          <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
        </div>
        <form action={customerLogoutAction}>
          <Button variant="outline" type="submit">
            <SignOut className="h-4 w-4" /> خروج
          </Button>
        </form>
      </div>

      {!inquiries || inquiries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 py-20 text-center">
          <ClockCounterClockwise className="h-12 w-12 text-ink-300" />
          <p className="text-ink-500">هنوز استعلامی ثبت نکرده‌اید.</p>
          <Button asChild><Link href="/collections">مرور کاتالوگ</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-5">
              <div>
                <span className="font-mono text-sm font-bold text-ink-900">{inquiry.inquiry_number}</span>
                <p className="mt-1 text-xs text-ink-400">{formatRelativeDate(inquiry.created_at)}</p>
              </div>
              <Badge variant={inquiry.status === 'completed' ? 'success' : inquiry.status === 'cancelled' ? 'danger' : 'soft'}>
                {INQUIRY_STATUS_LABELS[inquiry.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
