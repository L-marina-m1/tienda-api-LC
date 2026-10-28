
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [modoRegistro, setModoRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')

  const { iniciarSesion, registrarUsuario } = useAuth()
  const navegar = useNavigate()

  function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    try {
      let usuario

      if (modoRegistro) {
        usuario = registrarUsuario(
          nombre.trim(),
          correo.trim(),
          contrasena
        )
      } else {
        usuario = iniciarSesion(correo.trim(), contrasena)
      }

      navegar(
        usuario.rol === 'administrador' ? '/admin' : '/productos',
        { replace: true }
      )
    } catch (err) {
      setError(err.message || 'No se pudo completar la operación.')
    }
  }

  function cambiarModo() {
    setModoRegistro((actual) => !actual)
    setError('')
    setNombre('')
    setCorreo('')
    setContrasena('')
  }

  return (
    <main className="login-contenedor">
      <form
        className="formulario login-tarjeta"
        onSubmit={manejarEnvio}
      >
        <div className="login-icono">T</div>

        <p className="texto-superior">
          TU TECNOLOGÍA, A OTRO NIVEL
        </p>

        <h1>
          Tecno<span className="texto-azul">Store</span>
        </h1>

        <p className="texto-secundario">
          {modoRegistro
            ? 'Crea tu cuenta y descubre nuestros productos.'
            : 'Ingresa para descubrir nuestros productos electrónicos.'}
        </p>

        {modoRegistro && (
          <>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
          </>
        )}

        <label htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="cliente@ejemplo.com"
          autoComplete="email"
          required
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder={
            modoRegistro
              ? 'Mínimo 6 caracteres'
              : 'Ingresa tu contraseña'
          }
          autoComplete={
            modoRegistro ? 'new-password' : 'current-password'
          }
          minLength={modoRegistro ? 6 : undefined}
          required
        />

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton-principal">
          {modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'} →
        </button>

        <p className="texto-secundario">
          {modoRegistro
            ? '¿Ya tienes una cuenta?'
            : '¿Todavía no tienes cuenta?'}
        </p>

        <button
          type="button"
          className="boton-enlace"
          onClick={cambiarModo}
        >
          {modoRegistro ? 'Inicia sesión' : 'Regístrate aquí'}
        </button>

        <p className="aviso-demo">
          TecnoStore · Tu tecnología, a otro nivel.
        </p>
      </form>
    </main>
  )
}

export default Login
