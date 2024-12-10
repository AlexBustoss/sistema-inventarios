const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Conexión a la base de datos

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
router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params; // ID del usuario a actualizar
    const { nombre, email, rol } = req.body; // Datos enviados desde el frontend o Postman
    try {
        const query = 'UPDATE usuarios SET "Nombre" = $1, "Email" = $2, "Rol" = $3 WHERE "ID_Usuario" = $4 RETURNING *';
        const values = [nombre, email, rol, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json(result.rows[0]); // Devolvemos el usuario actualizado
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

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
router.post('/usuarios', async (req, res) => {
    const { Nombre, Email, Rol } = req.body;

    // Depurar: mostrar los valores recibidos
    console.log('Datos recibidos:', req.body);

    // Validar que los campos necesarios están presentes
    if (!Nombre || !Email || !Rol) {
        return res.status(400).json({ error: 'Por favor, proporciona Nombre, Email y Rol.' });
    }

    try {
        // Insertar el nuevo usuario en la base de datos
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios ("Nombre", "Email", "Rol") VALUES ($1, $2, $3) RETURNING *',
            [Nombre, Email, Rol]
        );        

        // Enviar la respuesta con el usuario insertado
        res.status(201).json(nuevoUsuario.rows[0]);
    } catch (err) {
        console.error('Error al crear usuario:', err.message); // Mostrar error exacto en la consola
        res.status(500).json({ error: 'Error al agregar el usuario' });
    }
});




module.exports = router;


