import type { Metadata } from 'next';
import { CustomerOtpLoginForm } from '@/components/public/customer-otp-login-form';

export const metadata: Metadata = { title: 'ورود به حساب کاربری' };

export default function AccountLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <CustomerOtpLoginForm />
    </div>
  );
}
