const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db'); // Importa initPool
const pool = initPool(); // Llama a la función para inicializar el pool
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ID_Usuario:
 *                     type: integer
 *                   Nombre:
 *                     type: string
 *                   Email:
 *                     type: string
 *                   Rol:
 *                     type: string
 */

// Obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios'); // Consulta SQL
        res.status(200).json(result.rows); // Devolvemos los resultados en formato JSON
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Email:
 *                 type: string
 *               Rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Usuario:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *                 Email:
 *                   type: string
 *                 Rol:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el usuario
 */


// Actualizar un usuario existente
router.put(
    '/usuarios/:id',
    [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('email').isEmail().withMessage('Debe ser un correo válido'),
        body('rol').notEmpty().withMessage('El rol es obligatorio'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { nombre, email, rol } = req.body;

        try {
            const query =
                'UPDATE usuarios SET "Nombre" = $1, "Email" = $2, "Rol" = $3 WHERE "ID_Usuario" = $4 RETURNING *';
            const values = [nombre, email, rol, id];
            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }
);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       404:
 *         description: Usuario no encontrado
 */

// Eliminar un usuario
router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params; // ID del usuario a eliminar
    try {
        const query = 'DELETE FROM usuarios WHERE "ID_Usuario" = $1 RETURNING *';
        const values = [id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado', usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Nombre:
 *                 type: string
 *               Email:
 *                 type: string
 *               Rol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID_Usuario:
 *                   type: integer
 *                 Nombre:
 *                   type: string
 *                 Email:
 *                   type: string
 *                 Rol:
 *                   type: string
 */

//Agregar usuario 
router.post(
    '/usuarios',
    [
        body('Nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('Email').isEmail().withMessage('Debe ser un correo válido'),
        body('Rol').notEmpty().withMessage('El rol es obligatorio'),
        body('Password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],
    async (req, res) => {
        // Validar errores en el request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Extraer datos del cuerpo
            const { Nombre, Email, Rol, Password } = req.body; // Esto debería funcionar ahora

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(Password, 10);

            // Insertar el nuevo usuario
            const nuevoUsuario = await pool.query(
                'INSERT INTO usuarios ("Nombre", "Email", "Rol", "Password") VALUES ($1, $2, $3, $4) RETURNING *',
                [Nombre, Email, Rol, hashedPassword]
            );

            // Devolver la respuesta sin la contraseña
            const { ID_Usuario, Nombre: nombre, Email: email, Rol: rol } = nuevoUsuario.rows[0];
            res.status(201).json({
                message: 'Usuario creado con éxito',
                usuario: { ID_Usuario, Nombre: nombre, Email: email, Rol: rol },
            });
        } catch (err) {
            console.error('Error al crear usuario:', err.message);

            if (err.code === '23505') {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            res.status(500).json({ error: 'Error al agregar el usuario' });
        }
    }
);





module.exports = router;


