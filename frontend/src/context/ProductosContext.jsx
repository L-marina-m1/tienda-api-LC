
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { obtenerProductos as obtenerProductosAPI } from '../services/api';

const ProductosContext = createContext(null);

const CLAVE_PRODUCTOS = 'tecnostore_productos';

const productosIniciales = [
  {
    id: 1,
    nombre: 'Laptop Lenovo IdeaPad',
    precio: 2499.90,
    categoria: 'Laptops',
    imagen: 'https://placehold.co/400x300?text=Laptop+Lenovo',
    stock: 10,
    disponible: true,
    fechaIngreso: '2026-10-01',
  },
  {
    id: 2,
    nombre: 'Mouse Logitech G203',
    precio: 89.90,
    categoria: 'Accesorios',
    imagen: 'https://placehold.co/400x300?text=Mouse+Logitech',
    stock: 25,
    disponible: true,
    fechaIngreso: '2026-10-02',
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico Redragon',
    precio: 159.90,
    categoria: 'Accesorios',
    imagen: 'https://placehold.co/400x300?text=Teclado+Redragon',
    stock: 15,
    disponible: true,
    fechaIngreso: '2026-10-03',
  },
  {
    id: 4,
    nombre: 'Monitor Samsung 24 pulgadas',
    precio: 699.90,
    categoria: 'Monitores',
    imagen: 'https://placehold.co/400x300?text=Monitor+Samsung',
    stock: 8,
    disponible: true,
    fechaIngreso: '2026-10-04',
  },
  {
    id: 5,
    nombre: 'Audífonos JBL',
    precio: 129.90,
    categoria: 'Audio',
    imagen: 'https://placehold.co/400x300?text=Audifonos+JBL',
    stock: 20,
    disponible: true,
    fechaIngreso: '2026-10-05',
  },
  {
    id: 6,
    nombre: 'Webcam Logitech',
    precio: 199.90,
    categoria: 'Accesorios',
    imagen: 'https://placehold.co/400x300?text=Webcam+Logitech',
    stock: 12,
    disponible: true,
    fechaIngreso: '2026-10-06',
  },
  {
    id: 7,
    nombre: 'Disco SSD Kingston 1TB',
    precio: 299.90,
    categoria: 'Almacenamiento',
    imagen: 'https://placehold.co/400x300?text=SSD+Kingston',
    stock: 14,
    disponible: true,
    fechaIngreso: '2026-10-07',
  },
  {
    id: 8,
    nombre: 'Memoria RAM Kingston 16GB',
    precio: 179.90,
    categoria: 'Componentes',
    imagen: 'https://placehold.co/400x300?text=RAM+Kingston',
    stock: 18,
    disponible: true,
    fechaIngreso: '2026-10-08',
  },
  {
    id: 9,
    nombre: 'Impresora HP',
    precio: 499.90,
    categoria: 'Impresoras',
    imagen: 'https://placehold.co/400x300?text=Impresora+HP',
    stock: 6,
    disponible: true,
    fechaIngreso: '2026-10-09',
  },
];

function fechaHoy() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

// Recuperar productos guardados localmente como datos iniciales.
function obtenerProductosLocales() {
  try {
    const guardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (guardados) {
      const productos = JSON.parse(guardados);

      if (Array.isArray(productos)) {
        return productos;
      }
    }
  } catch (error) {
    console.error('Error al recuperar los productos:', error);
  }

  return productosIniciales;
}

export function ProductosProvider({ children }) {
  const [productos, setProductos] = useState(obtenerProductosLocales);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState(null);

  // Cargar los productos desde el backend conectado a MariaDB.
  useEffect(() => {
    let activo = true;

    async function cargarProductosDesdeAPI() {
      try {
        const datos = await obtenerProductosAPI();

        if (!Array.isArray(datos)) {
          throw new Error('El backend no devolvió una lista de productos.');
        }

        const productosAPI = datos.map((producto) => ({
          ...producto,
          precio: Number(producto.precio) || 0,
          stock: Number(producto.stock) || 0,
          disponible: Number(producto.stock) > 0,
          categoria: producto.categoria || 'General',
          imagen:
            producto.imagen ||
            `https://placehold.co/400x300?text=${encodeURIComponent(
              producto.nombre || 'Producto'
            )}`,
          fechaIngreso: producto.fechaIngreso || fechaHoy(),
        }));

        if (activo) {
          setProductos(productosAPI);
          setErrorProductos(null);

          // Guardar la copia recibida del backend.
          try {
            localStorage.setItem(
              CLAVE_PRODUCTOS,
              JSON.stringify(productosAPI)
            );
          } catch (error) {
            console.error('Error al guardar los productos localmente:', error);
          }
        }
      } catch (error) {
        console.error('Error al cargar productos desde el backend:', error);

        if (activo) {
          setErrorProductos(
            'No se pudo conectar con el backend. Se muestran los productos guardados localmente.'
          );
        }
      } finally {
        if (activo) {
          setCargandoProductos(false);
        }
      }
    }

    cargarProductosDesdeAPI();

    return () => {
      activo = false;
    };
  }, []);

  // Guardar localmente los cambios realizados en el estado.
  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
      );
    } catch (error) {
      console.error('Error al guardar los productos:', error);
    }
  }, [productos]);

  function cambiarStock(id, cantidad) {
    const stock = Math.max(0, Math.floor(Number(cantidad) || 0));

    setProductos((actuales) =>
      actuales.map((producto) =>
        producto.id === id
          ? { ...producto, stock, disponible: stock > 0 }
          : producto
      )
    );
  }

  function cambiarDisponibilidad(id) {
    setProductos((actuales) =>
      actuales.map((producto) => {
        if (producto.id !== id) return producto;

        const nuevoStock = producto.disponible
          ? 0
          : Math.max(1, Number(producto.stock) || 1);

        return {
          ...producto,
          stock: nuevoStock,
          disponible: nuevoStock > 0,
        };
      })
    );
  }

  function agregarProducto(datos) {
    const stock = Math.max(
      0,
      Math.floor(Number(datos.stock) || 0)
    );

    const nuevoProducto = {
      ...datos,
      id: Date.now(),
      nombre: datos.nombre?.trim() || 'Producto nuevo',
      precio: Math.max(0, Number(datos.precio) || 0),
      stock,
      disponible: stock > 0,
      categoria: datos.categoria || 'General',
      imagen:
        datos.imagen ||
        `https://placehold.co/400x300?text=${encodeURIComponent(
          datos.nombre || 'Producto'
        )}`,
      fechaIngreso: fechaHoy(),
    };

    setProductos((actuales) => [...actuales, nuevoProducto]);

    return nuevoProducto;
  }

  function actualizarProducto(id, datos) {
    setProductos((actuales) =>
      actuales.map((producto) => {
        if (producto.id !== id) return producto;

        const stock =
          datos.stock === undefined
            ? producto.stock
            : Math.max(0, Math.floor(Number(datos.stock) || 0));

        return {
          ...producto,
          ...datos,
          id: producto.id,
          precio:
            datos.precio === undefined
              ? producto.precio
              : Math.max(0, Number(datos.precio) || 0),
          stock,
          disponible: stock > 0,
        };
      })
    );
  }

  function eliminarProducto(id) {
    setProductos((actuales) =>
      actuales.filter((producto) => producto.id !== id)
    );
  }

  const totalProductos = productos.length;

  const totalUnidades = productos.reduce(
    (total, producto) => total + Number(producto.stock || 0),
    0
  );

  const valorInventario = productos.reduce(
    (total, producto) =>
      total +
      Number(producto.precio || 0) * Number(producto.stock || 0),
    0
  );

  const productosAgotados = productos.filter(
    (producto) => Number(producto.stock) === 0
  ).length;

  return (
    <ProductosContext.Provider
      value={{
        productos,
        cargandoProductos,
        errorProductos,
        totalProductos,
        totalUnidades,
        valorInventario,
        productosAgotados,
        cambiarStock,
        cambiarDisponibilidad,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
}

export function useProductos() {
  const contexto = useContext(ProductosContext);

  if (!contexto) {
    throw new Error(
      'useProductos debe utilizarse dentro de ProductosProvider.'
    );
  }

  return contexto;
}
