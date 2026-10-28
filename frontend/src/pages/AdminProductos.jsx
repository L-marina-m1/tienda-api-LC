
import { useState } from 'react'
import { useProductos } from '../context/ProductosContext'

function AdminProductos() {
  const {
    productos,
    totalUnidades,
    valorInventario,
    productosAgotados,
    cambiarDisponibilidad,
    cambiarStock,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  } = useProductos()

  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Laptops')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('1')
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [cantidades, setCantidades] = useState({})

  function limpiarFormulario() {
    setNombre('')
    setCategoria('Laptops')
    setPrecio('')
    setStock('1')
    setEditandoId(null)
  }

  function guardarProducto(e) {
    e.preventDefault()

    const precioNumero = Number(precio)
    const stockNumero = Number(stock)

    if (
      !nombre.trim() ||
      !categoria ||
      !Number.isFinite(precioNumero) ||
      precioNumero <= 0 ||
      !Number.isInteger(stockNumero) ||
      stockNumero < 0
    ) {
      setMensaje('Revisa el nombre, el precio y la cantidad ingresada.')
      return
    }

    const datos = {
      nombre: nombre.trim(),
      categoria,
      precio: precioNumero,
      stock: stockNumero,
      descripcion: 'Producto electrónico de TecnoStore.',
      imagen: '📦',
    }

    if (editandoId !== null) {
      actualizarProducto(editandoId, datos)
      setMensaje('Producto actualizado correctamente.')
    } else {
      agregarProducto(datos)
      setMensaje('Producto agregado correctamente.')
    }

    limpiarFormulario()
  }

  function editarProducto(producto) {
    setNombre(producto.nombre)
    setCategoria(producto.categoria)
    setPrecio(String(producto.precio))
    setStock(String(producto.stock ?? 0))
    setEditandoId(producto.id)
    setMensaje('')
  }

  function borrarProducto(id) {
    eliminarProducto(id)

    if (editandoId === id) {
      limpiarFormulario()
    }

    setCantidades((actuales) => {
      const nuevas = { ...actuales }
      delete nuevas[id]
      return nuevas
    })

    setMensaje('Producto eliminado del catálogo.')
  }

  function mostrarFecha(fecha) {
    if (!fecha) return 'Sin fecha registrada'

    const partes = fecha.split('-')

    if (partes.length !== 3) return fecha

    const [anio, mes, dia] = partes
    return `${dia}/${mes}/${anio}`
  }

  function guardarStock(producto) {
    const valor =
      cantidades[producto.id] ?? String(producto.stock ?? 0)

    const cantidad = Number(valor)

    if (valor === '' || !Number.isInteger(cantidad) || cantidad < 0) {
      setMensaje('Ingresa una cantidad entera igual o mayor que cero.')
      return
    }

    cambiarStock(producto.id, cantidad)

    setCantidades((actuales) => ({
      ...actuales,
      [producto.id]: String(cantidad),
    }))

    setMensaje(
      `Stock de ${producto.nombre} actualizado correctamente.`
    )
  }

  return (
    <main className="pagina">
      <section className="catalogo-banner admin-banner">
        <div>
          <p className="texto-superior">PANEL DE CONTROL</p>

          <h1>
            Administrar <span className="texto-azul">productos</span>
          </h1>

          <p>
            Gestiona productos, precios, cantidades y fechas de ingreso.
          </p>
        </div>

        <div className="banner-icono">⚙️</div>
      </section>

      {/* RESUMEN DEL INVENTARIO */}

      <section className="estadisticas-inventario">
        <article className="estadistica-inventario">
          <span>📦</span>
          <p>Productos registrados</p>
          <strong>{productos.length}</strong>
        </article>

        <article className="estadistica-inventario">
          <span>🏬</span>
          <p>Unidades en stock</p>
          <strong>{totalUnidades}</strong>
        </article>

        <article className="estadistica-inventario">
          <span>💰</span>
          <p>Valor del inventario</p>
          <strong>
            S/{' '}
            {valorInventario.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </article>

        <article className="estadistica-inventario">
          <span>⚠️</span>
          <p>Productos agotados</p>
          <strong>{productosAgotados}</strong>
        </article>
      </section>

      <div className="admin-layout">
        {/* FORMULARIO PARA AGREGAR O EDITAR */}

        <section className="panel-admin">
          <p className="texto-superior">
            {editandoId !== null
              ? 'EDITAR PRODUCTO'
              : 'NUEVO PRODUCTO'}
          </p>

          <h2>
            {editandoId !== null
              ? 'Actualizar datos'
              : 'Agregar al catálogo'}
          </h2>

          <form className="formulario-admin" onSubmit={guardarProducto}>
            <label htmlFor="nombre-producto">
              Nombre del producto
            </label>

            <input
              id="nombre-producto"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Laptop HP"
              required
            />

            <label htmlFor="categoria-producto">Categoría</label>

            <select
              id="categoria-producto"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option>Laptops</option>
              <option>Celulares</option>
              <option>Accesorios</option>
              <option>Monitores</option>
              <option>Audio</option>
              <option>Almacenamiento</option>
              <option>Otros</option>
            </select>

            <label htmlFor="precio-producto">
              Precio por unidad (S/)
            </label>

            <input
              id="precio-producto"
              type="number"
              min="0.01"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
              required
            />

            <label htmlFor="stock-producto">
              Cantidad inicial en stock
            </label>

            <input
              id="stock-producto"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />

            <p className="ayuda-stock">
              Si ingresas 0 unidades, el producto aparecerá agotado.
            </p>

            <button type="submit" className="boton-principal">
              {editandoId !== null
                ? 'Guardar cambios'
                : '+ Agregar producto'}
            </button>

            {editandoId !== null && (
              <button
                type="button"
                className="boton-secundario"
                onClick={limpiarFormulario}
              >
                Cancelar edición
              </button>
            )}
          </form>

          {mensaje && (
            <p className="mensaje-pedido" role="status">
              {mensaje}
            </p>
          )}
        </section>

        {/* LISTA DE PRODUCTOS */}

        <section className="panel-admin admin-catalogo">
          <div className="encabezado-seccion">
            <div>
              <p className="texto-superior">INVENTARIO</p>
              <h2>Productos registrados</h2>
            </div>

            <span className="contador-productos">
              {productos.length}
            </span>
          </div>

          {productos.length === 0 ? (
            <p className="mensaje-vacio">
              Todavía no hay productos registrados.
            </p>
          ) : (
            <div className="admin-lista">
              {productos.map((producto) => {
                const cantidadActual =
                  cantidades[producto.id] ??
                  String(producto.stock ?? 0)

                // Si imagen contiene una URL, mostrar la cajita.
                // Si contiene un emoji, conservarlo.
                const imagenProducto =
                  typeof producto.imagen === 'string' &&
                  producto.imagen.trim() !== '' &&
                  !/^https?:\/\//i.test(producto.imagen.trim())
                    ? producto.imagen
                    : '📦'

                return (
                  <article className="admin-item" key={producto.id}>
                    <div className="admin-producto-icono">
                      {imagenProducto}
                    </div>

                    <div className="admin-producto-info">
                      <h3>{producto.nombre}</h3>

                      <p>{producto.categoria}</p>

                      <strong>
                        S/ {Number(producto.precio || 0).toFixed(2)} por
                        unidad
                      </strong>

                      <p className="dato-stock">
                        Cantidad en stock:{' '}
                        <strong>
                          {producto.stock ?? 0} unidades
                        </strong>
                      </p>

                      <p className="dato-fecha">
                        📅 Fecha de ingreso:{' '}
                        {mostrarFecha(producto.fechaIngreso)}
                      </p>

                      <span
                        className={
                          Number(producto.stock) > 0
                            ? 'estado-disponible'
                            : 'estado-agotado'
                        }
                      >
                        <span className="estado-punto" />
                        {Number(producto.stock) > 0
                          ? 'Disponible'
                          : 'Agotado'}
                      </span>

                      <label
                        className="etiqueta-stock"
                        htmlFor={`stock-${producto.id}`}
                      >
                        Actualizar cantidad
                      </label>

                      <div className="control-stock">
                        <input
                          id={`stock-${producto.id}`}
                          type="number"
                          min="0"
                          step="1"
                          value={cantidadActual}
                          onChange={(e) =>
                            setCantidades((actuales) => ({
                              ...actuales,
                              [producto.id]: e.target.value,
                            }))
                          }
                          aria-label={`Cantidad de ${producto.nombre}`}
                        />

                        <button
                          type="button"
                          className="boton-editar"
                          onClick={() => guardarStock(producto)}
                        >
                          Guardar stock
                        </button>
                      </div>
                    </div>

                    <div className="admin-acciones">
                      <button
                        type="button"
                        className={
                          Number(producto.stock) > 0
                            ? 'boton-agotar'
                            : 'boton-disponible'
                        }
                        onClick={() => {
                          cambiarDisponibilidad(producto.id)

                          setCantidades((actuales) => {
                            const nuevas = { ...actuales }
                            delete nuevas[producto.id]
                            return nuevas
                          })
                        }}
                      >
                        {Number(producto.stock) > 0
                          ? 'Marcar agotado'
                          : 'Marcar disponible'}
                      </button>

                      <button
                        type="button"
                        className="boton-editar"
                        onClick={() => editarProducto(producto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="boton-texto-eliminar"
                        onClick={() => borrarProducto(producto.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminProductos
