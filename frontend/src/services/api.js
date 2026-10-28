
const API_URL = 'http://localhost:3000/api';

// Obtener productos desde MariaDB mediante el backend
export async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/productos`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}
