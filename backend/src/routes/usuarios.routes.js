const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db');
const pool = initPool();
const bcrypt = require('bcrypt');
// Eliminamos las referencias a auth.middleware temporalmente
// const { validarToken, verificarRol } = require('../middlewares/auth.middleware');
const { validarUsuarioPost, validarUsuarioPut } = require('../middlewares/validacionesUsuarios');
const validarErrores = require('../middlewares/validarErrores');

// Obtener todos los usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT "ID_Usuario", "Nombre", "Email", "Rol" FROM usuarios');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Crear un nuevo usuario
router.post(
    '/usuarios',
    [validarUsuarioPost, validarErrores], // Eliminamos validarToken y verificarRol
    async (req, res) => {
        try {
            const { Nombre, Email, Rol, Password } = req.body;
            const hashedPassword = await bcrypt.hash(Password, 10);

            const result = await pool.query(
                `INSERT INTO usuarios ("Nombre", "Email", "Rol", "Password") 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING "ID_Usuario", "Nombre", "Email", "Rol"`,
                [Nombre, Email, Rol, hashedPassword]
            );

            res.status(201).json({
                message: 'Usuario creado con éxito',
                usuario: result.rows[0],
            });
        } catch (error) {
            console.error('Error al crear usuario:', error.message);
            if (error.code === '23505') {
                return res.status(400).json({ error: 'El correo ya está registrado' });
            }
            res.status(500).json({ error: 'Error al agregar el usuario' });
        }
    }
);

// Actualizar un usuario
router.put(
    '/usuarios/:id',
    [validarUsuarioPut, validarErrores], // Eliminamos validarToken y verificarRol
    async (req, res) => {
        const { id } = req.params;
        const { Nombre, Email, Rol } = req.body;

        try {
            const result = await pool.query(
                'UPDATE usuarios SET "Nombre" = $1, "Email" = $2, "Rol" = $3 WHERE "ID_Usuario" = $4 RETURNING "ID_Usuario", "Nombre", "Email", "Rol"',
                [Nombre, Email, Rol, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error(`Error al actualizar usuario con ID ${id}:`, error);
            res.status(500).json({ error: 'Error al actualizar usuario' });
        }
    }
);

// Eliminar un usuario
router.delete('/usuarios/:id', async (req, res) => { // Eliminamos validarToken y verificarRol
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE "ID_Usuario" = $1 RETURNING "ID_Usuario", "Nombre", "Email"', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado con éxito', usuario: result.rows[0] });
    } catch (error) {
        console.error(`Error al eliminar usuario con ID ${id}:`, error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;
