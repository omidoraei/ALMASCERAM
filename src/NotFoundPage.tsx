import { useSEO } from './lib/seo/useSEO'
import { SITE_NAME, SITE_URL } from './lib/seo/constants'

/**
 * NotFoundPage — fallback shown when the user navigates to a path that does
 * not map to /auth/callback, /account, /admin, or the public landing page.
 * The component is intentionally self-contained: it sets its own SEO meta
 * tags and renders a minimal, accessible layout that re-uses the public
 * typography. CSS lives in `not-found.css`.
 *
 * Status code: this is a SPA. To emit a real HTTP 404, configure your
 * host to serve `public/404.html` for unknown routes (Vercel/Netlify do
 * this by default; see `vercel.json` for the SPA rewrite).
 */
export function NotFoundPage() {
  useSEO({
    title: 'صفحه یافت نشد',
    description: 'صفحه‌ای که جستجو کردید وجود ندارد. به صفحه اصلی ALMASCERAM بازگردید.',
    canonicalPath: '/404',
    ogType: 'website',
    noindex: true,
  })

  return (
    <div className="not-found" dir="rtl" lang="fa">
      <main className="not-found-main" role="main">
        <p className="not-found-eyebrow">خطای ۴۰۴</p>
        <h1 className="not-found-title">صفحه‌ای که دنبال آن می‌گردید پیدا نشد</h1>
        <p className="not-found-body">
          ممکن است صفحه منتقل شده، حذف شده یا آدرس آن اشتباه وارد شده باشد.
          می‌توانید از طریق لینک‌های زیر به بخش‌های اصلی سایت دسترسی پیدا کنید.
        </p>
        <nav className="not-found-actions" aria-label="ناوبری صفحه خطا">
          <a className="not-found-primary" href={`${SITE_URL}/`}>بازگشت به صفحه اصلی</a>
          <a className="not-found-secondary" href={`${SITE_URL}/#catalog`}>مشاهده محصولات</a>
          <a className="not-found-secondary" href={`${SITE_URL}/#about`}>درباره {SITE_NAME}</a>
        </nav>
        <p className="not-found-help">
          اگر فکر می‌کنید این یک خطاست، با ما از طریق{' '}
          <a href="mailto:project@almasceram.ir">project@almasceram.ir</a> تماس بگیرید.
        </p>
      </main>
    </div>
  )
}

export default NotFoundPage
