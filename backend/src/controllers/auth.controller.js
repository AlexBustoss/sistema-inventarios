const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Conexión a la base de datos

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validar campos vacíos
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Consultar si el usuario existe en la base de datos (case-insensitive)
    const query = 'SELECT * FROM usuarios WHERE LOWER("Nombre") = LOWER($1)';
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.ID_Usuario, // Asegúrate de usar el nombre correcto del campo
        role: user.Rol,
        username: user.Nombre,
      },
      process.env.JWT_SECRET, // Llave secreta para el JWT
      { expiresIn: '2h' } // Tiempo de expiración
    );

    // Enviar respuesta exitosa con el token y datos del usuario
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user.ID_Usuario,
        nombre: user.Nombre,
        rol: user.Rol,
      },
    });
  } catch (error) {
    console.error('Error en el login:', error.message);
    next(error); // Pasar errores al middleware global
  }
};

module.exports = {
  login,
};
