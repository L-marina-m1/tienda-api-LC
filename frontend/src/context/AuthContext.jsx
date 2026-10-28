
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const CLAVE_USUARIOS = 'tecnostore_usuarios'
const CLAVE_SESION = 'tecnostore_sesion'

// Cuenta de administrador para la demostración local.
// No utilizar estas credenciales en producción.
const ADMIN_DEMO = {
  nombre: 'Administrador',
  correo: 'admin@tecnostore.com',
  contrasena: 'Admin123!',
  rol: 'administrador',
}

// Obtener usuarios guardados en el navegador.
function obtenerUsuarios() {
  try {
    const guardados = localStorage.getItem(CLAVE_USUARIOS)

    if (guardados) {
      const usuarios = JSON.parse(guardados)

      if (!Array.isArray(usuarios)) {
        throw new Error('Los usuarios guardados no son válidos.')
      }

      // Mantener disponible la cuenta de administrador de demostración.
      const existeAdmin = usuarios.some(
        (usuario) => usuario.rol === 'administrador'
      )

      if (!existeAdmin) {
        usuarios.push(ADMIN_DEMO)
        localStorage.setItem(
          CLAVE_USUARIOS,
          JSON.stringify(usuarios)
        )
      }

      return usuarios
    }

    localStorage.setItem(
      CLAVE_USUARIOS,
      JSON.stringify([ADMIN_DEMO])
    )

    return [ADMIN_DEMO]
  } catch (error) {
    console.error('Error al leer los usuarios:', error)
    return [ADMIN_DEMO]
  }
}

// Recuperar la sesión al recargar la página.
function obtenerSesion() {
  try {
    const sesion = localStorage.getItem(CLAVE_SESION)

    if (!sesion) return null

    const usuario = JSON.parse(sesion)

    if (
      !usuario ||
      typeof usuario.correo !== 'string' ||
      !['cliente', 'administrador'].includes(usuario.rol)
    ) {
      localStorage.removeItem(CLAVE_SESION)
      return null
    }

    return usuario
  } catch (error) {
    console.error('Error al recuperar la sesión:', error)
    localStorage.removeItem(CLAVE_SESION)
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(obtenerSesion)

  // Iniciar sesión con correo y contraseña.
  function iniciarSesion(correo, contrasena) {
    const usuarios = obtenerUsuarios()
    const correoNormalizado = correo.trim().toLowerCase()

    const encontrado = usuarios.find(
      (item) =>
        item.correo.toLowerCase() === correoNormalizado &&
        item.contrasena === contrasena
    )

    if (!encontrado) {
      throw new Error('Correo o contraseña incorrectos.')
    }

    const sesion = {
      nombre: encontrado.nombre,
      correo: encontrado.correo,
      rol: encontrado.rol,
    }

    localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(sesion)
    )

    setUsuario(sesion)

    return sesion
  }

  // Registrar una cuenta nueva exclusivamente como cliente.
  function registrarUsuario(nombre, correo, contrasena) {
    const nombreNormalizado = nombre.trim()
    const correoNormalizado = correo.trim().toLowerCase()

    if (!nombreNormalizado) {
      throw new Error('Ingresa tu nombre.')
    }

    if (!correoNormalizado) {
      throw new Error('Ingresa tu correo electrónico.')
    }

    if (contrasena.length < 6) {
      throw new Error(
        'La contraseña debe tener al menos 6 caracteres.'
      )
    }

    const usuarios = obtenerUsuarios()

    const correoExiste = usuarios.some(
      (item) =>
        item.correo.toLowerCase() === correoNormalizado
    )

    if (correoExiste) {
      throw new Error('Este correo ya está registrado.')
    }

    const nuevoUsuario = {
      nombre: nombreNormalizado,
      correo: correoNormalizado,
      contrasena,
      rol: 'cliente',
    }

    usuarios.push(nuevoUsuario)

    localStorage.setItem(
      CLAVE_USUARIOS,
      JSON.stringify(usuarios)
    )

    // Iniciar sesión automáticamente después del registro.
    const sesion = {
      nombre: nuevoUsuario.nombre,
      correo: nuevoUsuario.correo,
      rol: 'cliente',
    }

    localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify(sesion)
    )

    setUsuario(sesion)

    return sesion
  }

  // Cerrar sesión.
  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
