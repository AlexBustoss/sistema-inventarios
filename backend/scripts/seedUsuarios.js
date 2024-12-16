const bcrypt = require('bcrypt');
const { initPool, closePool } = require('../src/config/db.js');

const usuarios = [
  {
    nombre: 'Administrador',
    email: 'admin@example.com',
    rol: 'Administrador',
    password: 'admin123',
  },
];

const seedUsuarios = async () => {
  const pool = initPool();

  try {
    for (const usuario of usuarios) {
      const hashedPassword = await bcrypt.hash(usuario.password, 10);
      await pool.query(
        `INSERT INTO usuarios (nombre, email, rol, password) VALUES ($1, $2, $3, $4)`,
        [usuario.nombre, usuario.email, usuario.rol, hashedPassword]
      );
    }
    console.log('Usuario administrador creado exitosamente');
  } catch (error) {
    console.error('Error al crear usuarios iniciales:', error);
  } finally {
    await closePool();
  }
};

seedUsuarios();
