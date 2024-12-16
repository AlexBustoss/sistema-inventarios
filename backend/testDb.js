const { initPool, closePool } = require('./src/config/db');

const testDbConnection = async () => {
  try {
    const pool = initPool(); // Inicializar pool
    const result = await pool.query('SELECT NOW()'); // Consulta de prueba
    console.log('Prueba exitosa, fecha actual desde la BD:', result.rows[0].now);
  } catch (error) {
    console.error('Error al probar la conexión a la base de datos:', error);
  } finally {
    await closePool(); // Cerrar conexiones
  }
};

testDbConnection();
