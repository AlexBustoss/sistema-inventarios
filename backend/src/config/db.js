const { Pool } = require('pg');

let pool;

function initPool() {
    if (!pool) {
        pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });

        console.log('Conexión a PostgreSQL exitosa');
    }
    return pool;
}

function getPool() {
    if (!pool) {
        throw new Error('El pool no ha sido inicializado. Llama a initPool primero.');
    }
    return pool;
}

function closePool() {
    if (pool) {
        pool.end();
        console.log('Conexión a PostgreSQL cerrada');
    }
}

module.exports = {
    initPool,
    getPool,
    closePool,
};
