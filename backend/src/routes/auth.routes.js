const express = require("express");
const router = express.Router();
const { initPool } = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = initPool(); // Inicializa la conexión a PostgreSQL

// Middleware para autenticar el token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No se proporcionó un token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido" });
        }
        req.user = user; // Agregar la información del usuario al objeto request
        next();
    });
};

// Ruta para obtener información del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.ID_Usuario; // ID del usuario desde el token

        const result = await pool.query(
            'SELECT "ID_Usuario", "Nombre", "Email", "Rol" FROM usuarios WHERE "ID_Usuario" = $1',
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error al obtener datos del usuario:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta de login
router.post("/login", async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE "Email" = $1', [Email]);
        console.log("Resultado de la búsqueda del usuario:", result.rows);

        if (result.rowCount === 0) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        let usuario = result.rows[0];
        console.log("Contraseña ingresada:", Password);
        console.log("Hash en la base de datos:", usuario.Password);

        let passwordCorrecta = await bcrypt.compare(Password, usuario.Password);
        if (!passwordCorrecta && !usuario.Password.startsWith("$2b$")) {
            // Actualizar la contraseña si está en texto plano
            console.log(`Contraseña no hasheada detectada para usuario ID ${usuario.ID_Usuario}. Actualizando...`);
            const hashedPassword = await bcrypt.hash(usuario.Password, 10);
            await pool.query(
                'UPDATE usuarios SET "Password" = $1 WHERE "ID_Usuario" = $2',
                [hashedPassword, usuario.ID_Usuario]
            );

            console.log(`Contraseña actualizada automáticamente para el usuario ID ${usuario.ID_Usuario}`);

            // Reintentar la comparación
            const updatedResult = await pool.query('SELECT * FROM usuarios WHERE "ID_Usuario" = $1', [usuario.ID_Usuario]);
            usuario = updatedResult.rows[0];
            passwordCorrecta = await bcrypt.compare(Password, usuario.Password);
        }

        if (!passwordCorrecta) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { ID_Usuario: usuario.ID_Usuario, Nombre: usuario.Nombre, Email: usuario.Email, Rol: usuario.Rol },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login exitoso", token });
    } catch (err) {
        console.error("Error en el login:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Ruta para obtener información del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.ID_Usuario;

        // Consultar información del usuario desde la base de datos
        const result = await pool.query('SELECT "ID_Usuario", "Nombre", "Email", "Rol" FROM usuarios WHERE "ID_Usuario" = $1', [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const user = result.rows[0];
        res.status(200).json(user); // Enviar la información del usuario
    } catch (err) {
        console.error("Error al obtener información del usuario:", err.message);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
