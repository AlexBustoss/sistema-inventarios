const { Pool } = require('pg');
require('dotenv').config();

let pool;

// Función para inicializar el pool de conexiones
const initPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    pool.on('connect', () => {
      console.log('Conexión a PostgreSQL exitosa');
    });

    pool.on('error', (err) => {
      console.error('Error en el pool de conexiones:', err);
    });
  }
  return pool; // Retorna el pool inicializado
};

// Función para cerrar el pool de conexiones
const closePool = async () => {
  if (pool) {
    await pool.end();
    console.log('Conexiones al pool de PostgreSQL cerradas');
    pool = null;
  }
};

module.exports = {
  initPool, // Exportar la función para inicializar el pool
  closePool, // Exportar la función para cerrar el pool
};
