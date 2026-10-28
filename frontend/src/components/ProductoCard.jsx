
function obtenerEmojiProducto(producto) {
  const nombre = (producto.nombre || '').toLowerCase()
  const categoria = (producto.categoria || '').toLowerCase()

  // Detectar el producto por su nombre
  if (
    nombre.includes('audífono') ||
    nombre.includes('audifono') ||
    nombre.includes('auricular') ||
    nombre.includes('headset')
  ) {
    return '🎧'
  }

  if (
    nombre.includes('laptop') ||
    nombre.includes('portátil') ||
    nombre.includes('portatil') ||
    nombre.includes('notebook')
  ) {
    return '💻'
  }

  if (
    nombre.includes('mouse') ||
    nombre.includes('ratón') ||
    nombre.includes('raton')
  ) {
    return '🖱️'
  }

  if (nombre.includes('teclado')) {
    return '⌨️'
  }

  if (
    nombre.includes('celular') ||
    nombre.includes('iphone') ||
    nombre.includes('smartphone')
  ) {
    return '📱'
  }

  if (
    nombre.includes('monitor') ||
    nombre.includes('pantalla')
  ) {
    return '🖥️'
  }

  if (
    nombre.includes('tablet') ||
    nombre.includes('ipad')
  ) {
    return '📱'
  }

  if (nombre.includes('impresora')) {
    return '🖨️'
  }

  if (
    nombre.includes('disco duro') ||
    nombre.includes('memoria usb') ||
    nombre.includes('ssd')
  ) {
    return '💾'
  }

  if (
    nombre.includes('parlante') ||
    nombre.includes('altavoz')
  ) {
    return '🔊'
  }

  if (
    nombre.includes('cámara') ||
    nombre.includes('camara') ||
    nombre.includes('webcam')
  ) {
    return '📷'
  }

  // Si no se reconoce el nombre, utilizar la categoría
  if (categoria.includes('laptop')) return '💻'
  if (categoria.includes('celular')) return '📱'
  if (categoria.includes('audio')) return '🎧'
  if (categoria.includes('monitor')) return '🖥️'
  if (categoria.includes('almacenamiento')) return '💾'
  if (categoria.includes('accesorio')) return '🖱️'

  // Conservar el emoji guardado, si existe y no es una URL
  const imagen = producto.imagen

  if (
    typeof imagen === 'string' &&
    imagen.trim() !== '' &&
    !/^https?:\/\//i.test(imagen.trim())
  ) {
    return imagen
  }

  return '📦'
}

function ProductoCard({
  producto,
  agregarAlCarrito,
  mostrarCompra = true,
}) {
  const stock = Math.max(0, Number(producto.stock) || 0)

  const agotado =
    stock === 0 || producto.disponible === false

  const emoji = obtenerEmojiProducto(producto)

  function manejarCompra() {
    if (agotado || typeof agregarAlCarrito !== 'function') {
      return
    }

    agregarAlCarrito(producto)
  }

  return (
    <article className="producto-card">
      <div className="producto-foto">
        <span
          className="producto-emoji"
          role="img"
          aria-label={producto.nombre || 'Producto'}
        >
          {emoji}
        </span>

        <span className="producto-etiqueta">
          {producto.categoria || 'General'}
        </span>
      </div>

      <div className="producto-contenido">
        <h3>{producto.nombre}</h3>

        {producto.descripcion && (
          <p>{producto.descripcion}</p>
        )}

        <p
          className={
            agotado
              ? 'producto-stock producto-stock-agotado'
              : 'producto-stock'
          }
        >
          {agotado
            ? 'Producto agotado'
            : `Stock disponible: ${stock}`}
        </p>

        <div className="producto-pie">
          <strong>
            S/ {Number(producto.precio || 0).toFixed(2)}
          </strong>

          {mostrarCompra && (
            <button
              type="button"
              className="boton-agregar"
              onClick={manejarCompra}
              disabled={agotado}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              {agotado ? 'Sin stock' : '+ Agregar'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductoCard
