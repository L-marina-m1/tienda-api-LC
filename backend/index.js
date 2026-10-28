
const express = require('express');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());

// =====================================
// CONEXION CON MARIADB
// =====================================

const pool = mariadb.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'tienda_api',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tienda_electronica',
    connectionLimit: 5
});

// =====================================
// FUNCIONES AUXILIARES
// =====================================

function validarId(idTexto) {
    if (!/^[1-9]\d*$/.test(idTexto)) {
        return null;
    }

    const id = Number(idTexto);
    return Number.isSafeInteger(id) ? id : null;
}

function validarProducto(datos) {
    if (!datos || typeof datos !== 'object') {
        return false;
    }

    const { nombre, precio, stock } = datos;

    return (
        typeof nombre === 'string' &&
        nombre.trim().length > 0 &&
        nombre.trim().length <= 255 &&
        precio !== undefined &&
        precio !== null &&
        typeof precio !== 'boolean' &&
        !(typeof precio === 'string' && !precio.trim()) &&
        Number.isFinite(Number(precio)) &&
        Number(precio) >= 0 &&
        stock !== undefined &&
        stock !== null &&
        typeof stock !== 'boolean' &&
        !(typeof stock === 'string' && !stock.trim()) &&
        Number.isSafeInteger(Number(stock)) &&
        Number(stock) >= 0
    );
}

// =====================================
// AUTENTICACION Y PERMISOS
// =====================================

function verificarToken(req, res, next) {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Debes iniciar sesion para realizar esta accion'
        });
    }

    const token = autorizacion.substring(7);

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Token invalido o expirado. Inicia sesion nuevamente'
        });
    }
}

function permitirRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta accion'
            });
        }

        next();
    };
}

// =====================================
// RUTA PRINCIPAL
// =====================================

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de la tienda electronica funcionando correctamente'
    });
});

// =====================================
// 1. CONSULTAR TODOS LOS PRODUCTOS
// Publico: cualquier usuario puede consultar
// =====================================

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await pool.query(
            'SELECT * FROM productos ORDER BY id'
        );

        res.json(productos);
    } catch (error) {
        console.error('Error al consultar productos:', error.message);

        res.status(500).json({
            error: 'Error al consultar los productos'
        });
    }
});

// =====================================
// 2. BUSCAR PRODUCTO POR ID
// =====================================

app.get('/api/productos/:id', async (req, res) => {
    try {
        const id = validarId(req.params.id);

        if (id === null) {
            return res.status(400).json({
                error: 'ID de producto no valido'
            });
        }

        const productos = await pool.query(
            'SELECT * FROM productos WHERE id = ?',
            [id]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json(productos[0]);
    } catch (error) {
        console.error('Error al buscar producto:', error.message);

        res.status(500).json({
            error: 'Error al consultar el producto'
        });
    }
});

// =====================================
// 3. REGISTRAR PRODUCTO
// Solo administrador
// =====================================

app.post(
    '/api/productos',
    verificarToken,
    permitirRoles('administrador'),
    async (req, res) => {
        try {
            const { nombre, descripcion, precio, stock } = req.body || {};

            if (!validarProducto(req.body)) {
                return res.status(400).json({
                    error: 'Ingresa un nombre, precio y stock validos'
                });
            }

            if (
                descripcion !== undefined &&
                descripcion !== null &&
                typeof descripcion !== 'string'
            ) {
                return res.status(400).json({
                    error: 'La descripcion debe ser texto'
                });
            }

            const resultado = await pool.query(
                `INSERT INTO productos
                 (nombre, descripcion, precio, stock)
                 VALUES (?, ?, ?, ?)`,
                [
                    nombre.trim(),
                    typeof descripcion === 'string'
                        ? descripcion.trim() || null
                        : null,
                    Number(precio),
                    Number(stock)
                ]
            );

            res.status(201).json({
                mensaje: 'Producto registrado correctamente',
                id: Number(resultado.insertId)
            });
        } catch (error) {
            console.error('Error al registrar producto:', error.message);

            res.status(500).json({
                error: 'Error al registrar el producto'
            });
        }
    }
);

// =====================================
// 4. EDITAR PRODUCTO
// Solo administrador
// =====================================

app.put(
    '/api/productos/:id',
    verificarToken,
    permitirRoles('administrador'),
    async (req, res) => {
        try {
            const id = validarId(req.params.id);
            const { nombre, descripcion, precio, stock } = req.body || {};

            if (id === null) {
                return res.status(400).json({
                    error: 'ID de producto no valido'
                });
            }

            if (!validarProducto(req.body)) {
                return res.status(400).json({
                    error: 'Ingresa un nombre, precio y stock validos'
                });
            }

            if (
                descripcion !== undefined &&
                descripcion !== null &&
                typeof descripcion !== 'string'
            ) {
                return res.status(400).json({
                    error: 'La descripcion debe ser texto'
                });
            }

            const productos = await pool.query(
                'SELECT id FROM productos WHERE id = ?',
                [id]
            );

            if (productos.length === 0) {
                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            await pool.query(
                `UPDATE productos
                 SET nombre = ?, descripcion = ?, precio = ?, stock = ?
                 WHERE id = ?`,
                [
                    nombre.trim(),
                    typeof descripcion === 'string'
                        ? descripcion.trim() || null
                        : null,
                    Number(precio),
                    Number(stock),
                    id
                ]
            );

            res.json({
                mensaje: 'Producto actualizado correctamente',
                id
            });
        } catch (error) {
            console.error('Error al editar producto:', error.message);

            res.status(500).json({
                error: 'Error al actualizar el producto'
            });
        }
    }
);

// =====================================
// 5. ELIMINAR PRODUCTO
// Solo administrador
// =====================================

app.delete(
    '/api/productos/:id',
    verificarToken,
    permitirRoles('administrador'),
    async (req, res) => {
        try {
            const id = validarId(req.params.id);

            if (id === null) {
                return res.status(400).json({
                    error: 'ID de producto no valido'
                });
            }

            const resultado = await pool.query(
                'DELETE FROM productos WHERE id = ?',
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            res.json({
                mensaje: 'Producto eliminado correctamente',
                id
            });
        } catch (error) {
            console.error('Error al eliminar producto:', error.message);

            res.status(500).json({
                error: 'Error al eliminar el producto'
            });
        }
    }
);

// =====================================
// 6. REGISTRAR USUARIO
// Los registros nuevos son clientes
// =====================================

app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, correo, password } = req.body || {};

        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            typeof correo !== 'string' ||
            !correo.trim() ||
            typeof password !== 'string' ||
            password.length < 8
        ) {
            return res.status(400).json({
                error: 'Completa los datos y utiliza una contraseña de al menos 8 caracteres'
            });
        }

        const email = correo.trim().toLowerCase();

        const existentes = await pool.query(
            'SELECT id FROM usuarios WHERE correo = ?',
            [email]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                error: 'Este correo ya esta registrado'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // No se recibe el rol desde el cliente.
        // MariaDB asigna "cliente" mediante su valor por defecto.
        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password_hash)
             VALUES (?, ?, ?)`,
            [nombre.trim(), email, passwordHash]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            id: Number(resultado.insertId),
            nombre: nombre.trim(),
            correo: email,
            rol: 'cliente'
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Este correo ya esta registrado'
            });
        }

        res.status(500).json({
            error: 'Error al registrar el usuario'
        });
    }
});

// =====================================
// 7. INICIAR SESION
// Devuelve el rol y un token JWT
// =====================================

app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body || {};

        if (
            typeof correo !== 'string' ||
            typeof password !== 'string' ||
            !correo.trim() ||
            !password
        ) {
            return res.status(400).json({
                error: 'Ingresa tu correo y contraseña'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('Falta configurar JWT_SECRET en .env');

            return res.status(500).json({
                error: 'Falta configurar JWT_SECRET en el servidor'
            });
        }

        const usuarios = await pool.query(
            `SELECT id, nombre, correo, password_hash, rol
             FROM usuarios
             WHERE correo = ?
             LIMIT 1`,
            [correo.trim().toLowerCase()]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                error: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = usuarios[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                error: 'Correo o contraseña incorrectos'
            });
        }

        const token = jwt.sign(
            {
                id: Number(usuario.id),
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Inicio de sesion correcto',
            token,
            usuario: {
                id: Number(usuario.id),
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesion:', error.message);

        res.status(500).json({
            error: 'Error al iniciar sesion'
        });
    }
});

// =====================================
// 8. CONSULTAR USUARIOS
// Solo administrador
// =====================================

app.get(
    '/api/usuarios',
    verificarToken,
    permitirRoles('administrador'),
    async (req, res) => {
        try {
            const usuarios = await pool.query(
                `SELECT id, nombre, correo, rol
                 FROM usuarios
                 ORDER BY id`
            );

            res.json(usuarios);
        } catch (error) {
            console.error('Error al consultar usuarios:', error.message);

            res.status(500).json({
                error: 'Error al consultar los usuarios'
            });
        }
    }
);

// =====================================
// 9. ELIMINAR USUARIO
// Solo administrador
// =====================================

app.delete(
    '/api/usuarios/:id',
    verificarToken,
    permitirRoles('administrador'),
    async (req, res) => {
        try {
            const id = validarId(req.params.id);

            if (id === null) {
                return res.status(400).json({
                    error: 'ID de usuario no valido'
                });
            }

            // Evitar que el administrador elimine su propia cuenta.
            if (Number(req.usuario.id) === id) {
                return res.status(400).json({
                    error: 'No puedes eliminar tu propia cuenta mientras estas conectado'
                });
            }

            const resultado = await pool.query(
                'DELETE FROM usuarios WHERE id = ?',
                [id]
            );

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                mensaje: 'Usuario eliminado correctamente',
                id
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error.message);

            res.status(500).json({
                error: 'Error al eliminar el usuario'
            });
        }
    }
);

// =====================================
// INICIAR SERVIDOR
// =====================================

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});
