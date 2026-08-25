import KaraApp from './KaraApp'
import AdminApp from './AdminApp'
import './kara.css'
import './admin.css'
import './admin-modules.css'

function App() {
  return window.location.pathname.startsWith('/admin') ? <AdminApp /> : <KaraApp />
}

export default App
