
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const { carrito } = useCarrito()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/')
  }

  if (!usuario) return null

  return (
    <header className="navbar">
      <NavLink
        to={usuario.rol === 'administrador' ? '/admin' : '/productos'}
        className="marca"
      >
        <span className="marca-icono">T</span>
        <span>Tecno<span className="texto-azul">Store</span></span>
      </NavLink>

      <nav className="navbar-enlaces">
        {usuario.rol === 'cliente' && (
          <>
            <NavLink to="/productos">Productos</NavLink>
            <NavLink to="/carrito">
              Carrito <span className="contador-carrito">{carrito.reduce((s, p) => s + p.cantidad, 0)}</span>
            </NavLink>
          </>
        )}

        {usuario.rol === 'administrador' && (
          <NavLink to="/admin">Administrar productos</NavLink>
        )}

        <span className="usuario-etiqueta">
          {usuario.rol === 'administrador' ? 'Administrador' : 'Cliente'}
        </span>

        <button type="button" onClick={salir} className="boton-salir">
          Cerrar sesión
        </button>
      </nav>
    </header>
  )
}

export default Navbar
