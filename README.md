
# Tienda Electrónica API

## Descripción
API REST para la gestión de una tienda electrónica, desarrollada con Node.js, Express y MariaDB.

## Objetivo
Desarrollar un servicio backend que permita administrar productos y usuarios de una tienda electrónica de manera organizada y segura.

## Tecnologías utilizadas
- Node.js
- Express
- MariaDB
- JSON Web Token (JWT)
- bcryptjs

## Funcionalidades
- Registro de usuarios.
- Inicio de sesión con contraseña cifrada.
- Autenticación mediante tokens JWT.
- Gestión de productos: registrar, consultar, actualizar y eliminar.
- Control de permisos según el rol del usuario.

## Instalación
1. Clonar el repositorio.
2. Ejecutar `npm install`.
3. Crear un archivo `.env` con las credenciales de la base de datos y la variable `JWT_SECRET`.
4. Crear la base de datos y las tablas necesarias en MariaDB.
5. Ejecutar `node index.js`.

## Seguridad
El archivo `.env` y la carpeta `node_modules/` no deben subirse al repositorio.

## Autor
Luz Marina
