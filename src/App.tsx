import { lazy, Suspense } from 'react'
import './theme.css'
import './a11y.css'
import './dark-overrides.css'
import './public.css'
import './admin.css'
import './admin-modules.css'
import './magic-link.css'
import './account.css'

// Route-level code splitting: each top-level app ships only when its path is hit.
// PublicApp is the default landing page so it's loaded eagerly to avoid an extra hop
// on the home view; admin/account/callback split into their own chunks.
import PublicApp from './PublicApp'
const AdminApp = lazy(() => import('./AdminApp'))
const AccountApp = lazy(() => import('./AccountApp'))
const MagicLinkCallback = lazy(() => import('./MagicLinkCallback'))

function RouteFallback() {
  return <div className="route-fallback" role="status" aria-live="polite"><span className="route-fallback-spinner" /><p>در حال بارگذاری...</p></div>
}

function App() {
  if (window.location.pathname.startsWith('/auth/callback')) {
    return <Suspense fallback={<RouteFallback />}><MagicLinkCallback /></Suspense>
  }
  if (window.location.pathname.startsWith('/account')) {
    return <Suspense fallback={<RouteFallback />}><AccountApp /></Suspense>
  }
  if (window.location.pathname.startsWith('/admin')) {
    return <Suspense fallback={<RouteFallback />}><AdminApp /></Suspense>
  }
  return <PublicApp />
}

export default App
