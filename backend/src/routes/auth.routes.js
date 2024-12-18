const express = require('express');
const router = express.Router();
const { initPool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const pool = initPool(); // Inicializa la conexión a PostgreSQL

router.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE "Email" = $1', [Email]);
        console.log('Resultado de la búsqueda del usuario:', result.rows);

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        let usuario = result.rows[0];
        console.log('Contraseña ingresada:', Password);
        console.log('Hash en la base de datos:', usuario.Password);

        // Verificar si la contraseña está en texto plano
        let passwordCorrecta = await bcrypt.compare(Password, usuario.Password);
        if (!passwordCorrecta && !usuario.Password.startsWith('$2b$')) {
            // Actualizar la contraseña si está en texto plano
            console.log(`Contraseña no hasheada detectada para usuario ID ${usuario.ID_Usuario}. Actualizando...`);
            const hashedPassword = await bcrypt.hash(usuario.Password, 10);
            await pool.query(
                'UPDATE usuarios SET "Password" = $1 WHERE "ID_Usuario" = $2',
                [hashedPassword, usuario.ID_Usuario]
            );

            console.log(`Contraseña actualizada automáticamente para el usuario ID ${usuario.ID_Usuario}`);
            
            // Volver a obtener el usuario actualizado
            const updatedResult = await pool.query('SELECT * FROM usuarios WHERE "ID_Usuario" = $1', [usuario.ID_Usuario]);
            usuario = updatedResult.rows[0];

            // Reintentar la comparación
            passwordCorrecta = await bcrypt.compare(Password, usuario.Password);
        }

        if (!passwordCorrecta) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign({ ID_Usuario: usuario.ID_Usuario, Rol: usuario.Rol }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ message: 'Login exitoso', token });
    } catch (err) {
        console.error('Error en el login:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
