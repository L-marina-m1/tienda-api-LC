
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Navbar from './components/Navbar'
import Login from './pages/Login'
import Productos from './pages/Productos'
import Carrito from './pages/Carrito'
import AdminProductos from './pages/AdminProductos'

function RutaProtegida({ rol, children }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/" replace />

  if (rol && usuario.rol !== rol) {
    return (
      <Navigate
        to={usuario.rol === 'administrador' ? '/admin' : '/productos'}
        replace
      />
    )
  }

  return children
}

function App() {
  const { usuario } = useAuth()

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            usuario
              ? <Navigate to={usuario.rol === 'administrador' ? '/admin' : '/productos'} replace />
              : <Login />
          }
        />

        <Route
          path="/productos"
          element={
            <RutaProtegida rol="cliente">
              <Productos />
            </RutaProtegida>
          }
        />

        <Route
          path="/carrito"
          element={
            <RutaProtegida rol="cliente">
              <Carrito />
            </RutaProtegida>
          }
        />

        <Route
          path="/admin"
          element={
            <RutaProtegida rol="administrador">
              <AdminProductos />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="pie-pagina">
        <p>© 2026 TecnoStore · Tu tecnología, a otro nivel.</p>
      </footer>
    </>
  )
}

export default App
