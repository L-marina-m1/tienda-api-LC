
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingCart,
  ShoppingBag,
  Package,
  Trash2,
  ArrowRight,
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
  Minus,
  Plus,
  MapPin,
} from 'lucide-react'

import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'

function Carrito() {
  const {
    carrito,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    total,
    totalUnidades,
  } = useCarrito()

  const { usuario } = useAuth()

  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [direccion, setDireccion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const unidades = totalUnidades ?? carrito.reduce(
    (suma, producto) => suma + Number(producto.cantidad || 0),
    0
  )

  function actualizarCantidad(id, cantidad) {
    setError('')
    setMensaje('')

    try {
      cambiarCantidad(id, cantidad)
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la cantidad.')
    }
  }

  function realizarPedido(e) {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (carrito.length === 0) {
      setError('Tu carrito está vacío.')
      return
    }

    if (!nombre.trim() || !direccion.trim()) {
      setError('Completa tu nombre y la dirección de entrega.')
      return
    }

    const nombreCliente = nombre.trim()
    const totalPedido = Number(total)

    setMensaje(
      `¡Gracias, ${nombreCliente}! Tu pedido por S/ ${totalPedido.toFixed(2)} se registró en esta demostración.`
    )

    vaciarCarrito()
    setDireccion('')
  }

  if (usuario?.rol !== 'cliente') {
    return (
      <main className="pagina carrito-pagina">
        <section className="carrito-sin-acceso">
          <div className="carrito-icono-grande">
            <ShoppingCart size={44} strokeWidth={1.7} />
          </div>

          <h1>Tu carrito te espera</h1>

          <p>
            Inicia sesión como cliente para realizar tu pedido.
          </p>

          <Link to="/" className="boton-principal enlace-boton">
            Ir al inicio de sesión
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="pagina carrito-pagina">
      <header className="carrito-encabezado">
        <div>
          <span className="carrito-etiqueta">
            TECNOSTORE / TU COMPRA
          </span>

          <h1>Mi carrito</h1>

          <p>Revisa tus productos y prepara tu pedido.</p>
        </div>

        <div className="carrito-contador">
          <span className="carrito-icono-tecnologia">
            <ShoppingCart size={30} strokeWidth={1.8} />
          </span>

          <div>
            <strong>{unidades}</strong>
            <small>
              {unidades === 1 ? 'unidad' : 'unidades'}
            </small>
          </div>
        </div>
      </header>

      {carrito.length === 0 ? (
        <section className="carrito-vacio">
          <div className="carrito-icono-grande">
            <ShoppingBag size={44} strokeWidth={1.7} />
          </div>

          <h2>Tu carrito está vacío</h2>

          <p>
            ¡Encuentra algo genial para tu equipo!
          </p>

          <Link
            to="/productos"
            className="boton-principal enlace-boton"
          >
            Explorar productos
            <ArrowRight size={18} />
          </Link>
        </section>
      ) : (
        <div className="carrito-layout">
          <section className="carrito-lista">
            <div className="carrito-lista-encabezado">
              <h2>Productos seleccionados</h2>

              <button
                type="button"
                className="carrito-vaciar"
                onClick={() => {
                  vaciarCarrito()
                  setError('')
                  setMensaje('')
                }}
              >
                <Trash2 size={16} />
                Vaciar carrito
              </button>
            </div>

            {carrito.map((producto) => (
              <article className="carrito-item" key={producto.id}>
                <div className="carrito-imagen">
                  {producto.imagen?.startsWith('http') ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src =
                          'https://placehold.co/160x160?text=Producto'
                      }}
                    />
                  ) : (
                    <span>{producto.imagen || '📦'}</span>
                  )}
                </div>

                <div className="carrito-detalle">
                  <span className="carrito-producto-etiqueta">
                    PRODUCTO TECNOLÓGICO
                  </span>

                  <h3>{producto.nombre}</h3>

                  <p className="carrito-precio-unidad">
                    S/ {Number(producto.precio || 0).toFixed(2)} por unidad
                  </p>

                  <div className="carrito-controles">
                    <label htmlFor={`cantidad-${producto.id}`}>
                      Cantidad
                    </label>

                    <input
                      id={`cantidad-${producto.id}`}
                      type="number"
                      min="1"
                      max={producto.stock}
                      value={producto.cantidad}
                      onChange={(e) =>
                        actualizarCantidad(
                          producto.id,
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="carrito-eliminar"
                      onClick={() => {
                        eliminarDelCarrito(producto.id)
                        setError('')
                        setMensaje('')
                      }}
                    >
                      <Trash2 size={15} />
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="carrito-subtotal">
                  <small>Subtotal</small>

                  <strong>
                    S/ {(
                      Number(producto.precio || 0) *
                      Number(producto.cantidad || 0)
                    ).toFixed(2)}
                  </strong>
                </div>
              </article>
            ))}

            <Link
              to="/productos"
              className="carrito-seguir-comprando"
            >
              <ArrowLeft size={18} />
              Seguir comprando
            </Link>
          </section>

          <aside className="resumen-compra">
            <div className="resumen-encabezado">
              <span className="resumen-icono-tecnologia">
                <ShoppingBag size={24} strokeWidth={1.8} />
              </span>

              <div>
                <h2>Resumen del pedido</h2>
                <p>El detalle de tu compra</p>
              </div>
            </div>

            <div className="resumen-fila">
              <span>Productos</span>
              <strong>{unidades}</strong>
            </div>

            <div className="resumen-fila">
              <span>Envío</span>
              <span className="resumen-envio">
                Por confirmar
              </span>
            </div>

            <div className="resumen-total">
              <span>Total del pedido</span>

              <strong>
                S/ {Number(total).toFixed(2)}
              </strong>
            </div>

            <form
              className="formulario-pedido"
              onSubmit={realizarPedido}
            >
              <h3>Datos de entrega</h3>

              <div className="campo-pedido">
                <label htmlFor="nombre-pedido">
                  Nombre completo
                </label>

                <div className="campo-icono">
                  <input
                    id="nombre-pedido"
                    type="text"
                    placeholder="Escribe tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="campo-pedido">
                <label htmlFor="direccion-pedido">
                  Dirección de entrega
                </label>

                <div className="campo-icono">
                  <MapPin
                    size={18}
                    className="icono-campo"
                  />

                  <input
                    id="direccion-pedido"
                    type="text"
                    placeholder="Calle, número, distrito..."
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    autoComplete="street-address"
                    required
                  />
                </div>
              </div>

              <button
                className="boton-principal boton-confirmar-pedido"
                type="submit"
              >
                Confirmar pedido
                <ArrowRight size={19} />
              </button>

              <p className="resumen-seguridad">
                <LockKeyhole size={14} />
                Revisa tus datos antes de confirmar.
              </p>
            </form>
          </aside>
        </div>
      )}

      <div className="carrito-mensajes" aria-live="polite">
        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="mensaje-pedido" role="status">
            <ShieldCheck size={19} />
            {mensaje}
          </p>
        )}
      </div>
    </main>
  )
}

export default Carrito
