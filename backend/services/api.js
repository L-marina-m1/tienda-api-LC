
const API_URL = 'http://localhost:3000/api';

// Obtener productos
export async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/productos`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}

// Crear producto
export async function crearProducto(datos) {
  const respuesta = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.mensaje || resultado.error || 'No se pudo crear el producto');
  }

  return resultado;
}

// Actualizar producto
export async function editarProducto(id, datos) {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });

  const resultado = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(resultado.mensaje || resultado.error || 'No se pudo actualizar el producto');
  }

  return resultado;
}

// Eliminar producto
export async function borrarProducto(id) {
  const respuesta = await fetch(`${API_URL}/productos/${id}`, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar el producto');
  }

  return true;
}
