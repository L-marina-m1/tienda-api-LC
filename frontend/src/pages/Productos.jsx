
import { useMemo, useState } from 'react'
import ProductoCard from '../components/ProductoCard'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'
import { useProductos } from '../context/ProductosContext'

function Productos() {
  const { usuario } = useAuth()
  const { agregarAlCarrito } = useCarrito()
  const { productos } = useProductos()

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [mensaje, setMensaje] = useState('')

  const categorias = useMemo(
    () => [
      'Todas',
      ...new Set(
        productos.map((producto) => producto.categoria || 'General')
      ),
    ],
    [productos]
  )

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const nombre = (producto.nombre || '').toLowerCase()
      const termino = busqueda.trim().toLowerCase()

      const coincideNombre = nombre.includes(termino)

      const coincideCategoria =
        categoria === 'Todas' ||
        (producto.categoria || 'General') === categoria

      return coincideNombre && coincideCategoria
    })
  }, [productos, busqueda, categoria])

  function agregar(producto) {
    if (
      !usuario ||
      usuario.rol !== 'cliente' ||
      Number(producto.stock) <= 0 ||
      producto.disponible === false
    ) {
      setMensaje('Este producto no está disponible para la compra.')
      return
    }

    try {
      agregarAlCarrito(producto)
      setMensaje(`${producto.nombre} se agregó al carrito.`)
    } catch (error) {
      setMensaje(error.message || 'No se pudo agregar el producto.')
    }
  }

  return (
    <main className="pagina">
      <section className="catalogo-banner">
        <div>
          <p className="texto-superior">
            TECNOLOGÍA PARA TU DÍA A DÍA
          </p>

          <h1>
            Encuentra tu próximo{' '}
            <span className="texto-azul">dispositivo.</span>
          </h1>

          <p>
            Explora laptops, celulares, periféricos y accesorios tecnológicos.
          </p>
        </div>

        <div className="banner-icono" aria-hidden="true">
          💻
        </div>
      </section>

      <section className="catalogo-seccion">
        <div className="encabezado-seccion">
          <div>
            <p className="texto-superior">NUESTRO CATÁLOGO</p>
            <h2>Productos destacados</h2>
          </div>

          <span className="contador-productos">
            {productosFiltrados.length}{' '}
            {productosFiltrados.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="filtros-productos">
          <input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar laptop, celular, mouse..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select
            aria-label="Filtrar por categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {mensaje && (
          <p className="mensaje-pedido" role="status">
            {mensaje}
          </p>
        )}

        {productosFiltrados.length > 0 ? (
          <div className="productos-grid">
            {productosFiltrados.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                agregarAlCarrito={agregar}
                mostrarCompra={usuario?.rol === 'cliente'}
              />
            ))}
          </div>
        ) : (
          <p className="mensaje-vacio">
            No encontramos productos con esos criterios. Prueba otra búsqueda.
          </p>
        )}
      </section>
    </main>
  )
}

export default Productos
