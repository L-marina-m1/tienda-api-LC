
import {
  createContext,
  useContext,
  useState,
} from 'react'

import { useProductos } from './ProductosContext'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([])
  const { productos } = useProductos()

  function agregarAlCarrito(producto) {
    const productoActual = productos.find(
      (item) => item.id === producto.id
    )

    if (
      !productoActual ||
      productoActual.disponible === false ||
      Number(productoActual.stock) <= 0
    ) {
      throw new Error('Este producto no tiene stock disponible.')
    }

    const stockDisponible = Number(productoActual.stock)

    const cantidadEnCarrito = carrito.find(
      (item) => item.id === producto.id
    )?.cantidad || 0

    if (cantidadEnCarrito >= stockDisponible) {
      throw new Error(
        `Solo hay ${stockDisponible} unidades disponibles de ${productoActual.nombre}.`
      )
    }

    setCarrito((actual) => {
      const existe = actual.find(
        (item) => item.id === productoActual.id
      )

      if (existe) {
        return actual.map((item) =>
          item.id === productoActual.id
            ? {
                ...item,
                ...productoActual,
                cantidad: item.cantidad + 1,
              }
            : item
        )
      }

      return [
        ...actual,
        {
          ...productoActual,
          cantidad: 1,
        },
      ]
    })
  }

  function cambiarCantidad(id, cantidad) {
    const producto = productos.find((item) => item.id === id)

    if (!producto) {
      throw new Error('El producto ya no existe en el inventario.')
    }

    const stockDisponible = Number(producto.stock) || 0
    const cantidadValida = Math.floor(Number(cantidad))

    if (!Number.isFinite(cantidadValida) || cantidadValida < 1) {
      eliminarDelCarrito(id)
      return
    }

    if (
      producto.disponible === false ||
      cantidadValida > stockDisponible
    ) {
      throw new Error(
        `La cantidad máxima disponible es ${stockDisponible}.`
      )
    }

    setCarrito((actual) =>
      actual.map((item) =>
        item.id === id
          ? {
              ...item,
              ...producto,
              cantidad: cantidadValida,
            }
          : item
      )
    )
  }

  function eliminarDelCarrito(id) {
    setCarrito((actual) =>
      actual.filter((item) => item.id !== id)
    )
  }

  function vaciarCarrito() {
    setCarrito([])
  }

  const total = carrito.reduce(
    (suma, item) =>
      suma + Number(item.precio || 0) * Number(item.cantidad || 0),
    0
  )

  const totalUnidades = carrito.reduce(
    (suma, item) => suma + Number(item.cantidad || 0),
    0
  )

  return (
    <CarritoContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        cambiarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        total,
        totalUnidades,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const contexto = useContext(CarritoContext)

  if (!contexto) {
    throw new Error(
      'useCarrito debe utilizarse dentro de CarritoProvider.'
    )
  }

  return contexto
}
