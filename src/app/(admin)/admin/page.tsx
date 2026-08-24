import type { Metadata } from 'next';
import { Stack, Ruler, Envelope, ShieldCheck, Hourglass } from '@phosphor-icons/react/dist/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'داشبورد مدیریت' };

const placeholderStats = [
  { icon: Stack, label: 'کالکشن‌ها', value: '—' },
  { icon: Ruler, label: 'محصولات و سایزها', value: '—' },
  { icon: Envelope, label: 'استعلام‌های جدید', value: '—' },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-white">خوش آمدید به پنل مدیریت</h1>
        <p className="mt-1 text-sm text-ink-400">وضعیت فعلی استقرار: مرحله ۰ تا ۲ (زیرساخت و Server Actions) تکمیل شده است.</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {placeholderStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <stat.icon className="h-6 w-6 text-bronze-400" />
            <div className="mt-3 text-2xl font-black text-white">{stat.value}</div>
            <div className="mt-1 text-xs text-ink-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-bronze-500/30 bg-bronze-500/10 p-8">
        <div className="flex items-start gap-4">
          <Hourglass className="h-8 w-8 shrink-0 text-bronze-400" />
          <div>
            <h2 className="text-lg font-bold text-white">منتظر تأیید شما برای لایه ۹ (پنل مدیریت کامل)</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-300">
              طبق برنامه‌ریزی اعلام‌شده، زیرساخت Supabase (دیتابیس، RLS، توابع امنیتی)، Middleware
              حفاظتی و Server Actions کامل CRUD برای Collections، Series، Products و Sizes تکمیل شده
              است. طبق درخواست صریح شما، رابط‌های UI کامل پنل مدیریت (مدیریت محتوا، استعلام‌ها، گزارش‌گیری
              و audit log) در مرحله بعدی پیاده‌سازی خواهد شد.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-ink-500">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        Supabase: {isSupabaseConfigured() ? 'متصل و پیکربندی شده' : 'پیکربندی نشده (حالت دمو)'}
      </div>
    </div>
  );
}
