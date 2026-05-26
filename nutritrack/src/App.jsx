import { useState, useEffect } from 'react'
import Navbar      from './components/Navbar'
import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Registro    from './pages/Registro'
import Catalogo    from './pages/Catalogo'
import Perfil      from './pages/Perfil'
import Historial   from './pages/Historial'
import Recetas     from './pages/Recetas'
import { authService } from './services/api'

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const navigate = (p) => setPage(p)

  useEffect(() => {
    const u = authService.getUsuario()
    const t = localStorage.getItem('nutritrack_token')
    if (u && t) { setUser(u); setPage('dashboard') }
  }, [])

  const handleLogin = (token, usuario) => {
    authService.guardarSesion(token, usuario)
    setUser(usuario)
    setPage('dashboard')
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setPage('login')
  }

  return (
    <div>
      {page !== 'login' && (
        <Navbar page={page} navigate={navigate} user={user} onLogout={handleLogout} />
      )}
      <main style={{ paddingTop: page !== 'login' ? 'var(--nav-height)' : '0' }}>
        {page === 'login'     && <Login     navigate={navigate} onLogin={handleLogin} />}
        {page === 'dashboard' && <Dashboard navigate={navigate} user={user} />}
        {page === 'registro'  && <Registro  navigate={navigate} />}
        {page === 'catalogo'  && <Catalogo  navigate={navigate} />}
        {page === 'perfil'    && <Perfil    navigate={navigate} user={user} />}
        {page === 'historial' && <Historial navigate={navigate} />}
        {page === 'recetas'   && <Recetas   navigate={navigate} />}
      </main>
    </div>
  )
}
