import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="text-7xl font-black text-bronze-500">۴۰۴</span>
      <h1 className="text-2xl font-black text-ink-900">صفحه موردنظر یافت نشد</h1>
      <p className="max-w-md text-ink-500">ممکن است آدرس اشتباه باشد یا محصول موردنظر حذف شده باشد.</p>
      <Button asChild size="lg">
        <Link href="/">بازگشت به صفحه اصلی</Link>
      </Button>
    </div>
  );
}
