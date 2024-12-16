const bcrypt = require('bcrypt');
const pool = require('../config/db');

const crearUsuario = async (req, res, next) => {
  const { nombre, email, rol, password } = req.body;

  try {
    if (!nombre || !email || !rol || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, rol, password) VALUES ($1, $2, $3, $4)`,
      [nombre, email, rol, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    next(error); // Manejar errores
  }
};

module.exports = { crearUsuario };
