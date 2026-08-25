import KaraApp from './KaraApp'
import AdminApp from './AdminApp'
import MagicLinkCallback from './MagicLinkCallback'
import AccountApp from './AccountApp'
import './kara.css'
import './admin.css'
import './admin-modules.css'
import './magic-link.css'
import './account.css'

function App() {
  if (window.location.pathname.startsWith('/auth/callback')) return <MagicLinkCallback />
  if (window.location.pathname.startsWith('/account')) return <AccountApp />
  return window.location.pathname.startsWith('/admin') ? <AdminApp /> : <KaraApp />
}

export default App
