const db = require('./src/config/db'); // Asegúrate de que tu archivo db.js exporte la conexión

beforeEach(async () => {
    // Inserta datos temporales para pruebas
    await db.query('INSERT INTO requisiciones (ID_Requisicion, Estado_Requisicion) VALUES (1, \'Pendiente\')');
});

afterEach(async () => {
    // Limpia las tablas afectadas después de cada prueba
    await db.query('TRUNCATE TABLE requisiciones RESTART IDENTITY CASCADE');
});
