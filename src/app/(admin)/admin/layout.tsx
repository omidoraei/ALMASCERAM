import Link from 'next/link';
import { Gauge, SignOut } from '@phosphor-icons/react/dist/ssr';
import { adminLogoutAction } from '@/lib/actions/auth.actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950" style={{ backgroundColor: '#14120e' }}>
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <Link href="/admin" className="flex items-center gap-2 text-white">
          <Gauge className="h-5 w-5 text-bronze-400" />
          <span className="font-bold">پنل مدیریت</span>
        </Link>
        <form action={adminLogoutAction}>
          <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-ink-200 transition-colors hover:border-red-400 hover:text-red-300">
            <SignOut className="h-4 w-4" /> خروج
          </button>
        </form>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
