import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = { title: 'ورود به پنل مدیریت' };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4" style={{ backgroundColor: '#14120e' }}>
      <AdminLoginForm />
    </div>
  );
}
