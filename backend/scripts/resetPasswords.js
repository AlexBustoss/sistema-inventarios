const bcrypt = require('bcrypt');
const { initPool } = require('../src/config/db'); // Ajusta la ruta si es necesario
const pool = initPool();

const resetContraseñas = async () => {
    // Define las contraseñas originales por usuario
    const contraseñasOriginales = {
        1: 'defaultPassword',   // Usuario con ID 1
        2: 'defaultPassword',   // Usuario con ID 2
        3: 'defaultPassword',   // Usuario con ID 3
        11: 'defaultPassword',  // Usuario con ID 11
        12: 'defaultPassword',  // Usuario con ID 12
    };

    try {
        console.log('Iniciando reseteo de contraseñas...');

        // Iterar sobre cada usuario y actualizar su contraseña
        for (const [id, password] of Object.entries(contraseñasOriginales)) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE usuarios SET "Password" = $1 WHERE "ID_Usuario" = $2',
                [hashedPassword, id]
            );
            console.log(`Contraseña reseteada para el usuario ID ${id}`);
        }

        console.log('Restablecimiento de contraseñas completado.');
    } catch (error) {
        console.error('Error al resetear contraseñas:', error.message);
    } finally {
        pool.end();
    }
};

resetContraseñas();
