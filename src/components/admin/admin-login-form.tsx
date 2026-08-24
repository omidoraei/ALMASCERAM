'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LockKey } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminLoginAction } from '@/lib/actions/auth.actions';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await adminLoginAction({ email, password });
    setLoading(false);
    if (result.success) {
      toast.success('ورود موفق');
      router.push('/admin');
      router.refresh();
    } else {
      toast.error(result.error ?? 'ورود ناموفق بود');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bronze-500 text-white">
        <LockKey className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white">ورود به پنل مدیریت</h1>
        <p className="mt-1 text-sm text-ink-400">دسترسی محدود به کاربران ادمین فعال (Least Privilege)</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-ink-300">ایمیل</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-ink-500" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-ink-300">رمز عبور</Label>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="border-white/10 bg-white/5 text-white placeholder:text-ink-500" />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'در حال ورود...' : 'ورود'}
      </Button>
    </form>
  );
}
