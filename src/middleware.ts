// =============================================================================
// Middleware — حفاظت از مسیرهای /admin و /account
// لایه: 7 (زیرساخت) — اولین خط دفاعی قبل از رسیدن به Server Components
// توجه: بررسی نقش و RLS دقیق همواره در خود کوئری‌ها/Server Actions نیز تکرار می‌شود (Defense in Depth).
// =============================================================================
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAccountRoute = pathname.startsWith('/account') && pathname !== '/account/login';

  // اگر Supabase پیکربندی نشده (حالت دمو/توسعه) اجازه عبور می‌دهیم تا UI قابل مشاهده بماند
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminProfile || !adminProfile.is_active) {
      const redirectUrl = new URL('/admin/login', request.url);
      redirectUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAccountRoute && !user) {
    const redirectUrl = new URL('/account/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
